const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'js/main.js'), 'utf8');
const handler = source.split('/* ---- Contact form')[1].split('/* ---- Hamburger')[0];
const script = '/* ---- Contact form' + handler;

for (const file of fs.readdirSync(root).filter(name => name.endsWith('.html'))) {
    test(`${file} initializes the Google Ads tag once without recording a conversion on load`, () => {
        const html = fs.readFileSync(path.join(root, file), 'utf8');
        const head = html.split('<head>')[1].split('</head>')[0];
        assert.equal((head.match(/src="https:\/\/www.googletagmanager.com\/gtag\/js\?id=AW-18476545759"/g) || []).length, 1);
        assert.equal((head.match(/AW-\d+/g) || []).length, 2, `${file} should load only the current Google Ads tag`);
        const context = { window: {} };
        vm.createContext(context);
        for (const match of head.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
            // Browser window globals share the global scope.
            context.window = context;
            vm.runInContext(match[1], context);
        }
        const calls = context.dataLayer.map(args => Array.from(args));
        assert.equal(calls.filter(args => args[0] === 'config' && args[1] === 'AW-18476545759').length, 1);
        assert.equal(calls.filter(args => args[0] === 'event').length, 0);
    });
}

const whatsappHandler = '/* ---- WhatsApp conversion tracking' + source
    .split('/* ---- WhatsApp conversion tracking')[1]
    .split('/* ---- Contact form')[0];

test('a WhatsApp click records exactly one WhatsApp conversion', () => {
    let clickHandler;
    const calls = [];
    const whatsappLink = {
        addEventListener: (event, handler) => {
            if (event === 'click') clickHandler = handler;
        }
    };
    const context = {
        document: { querySelectorAll: () => [whatsappLink] },
        window: { gtag: (...args) => calls.push(args) }
    };

    vm.runInNewContext(whatsappHandler, context);
    assert.equal(calls.length, 0);
    clickHandler();
    assert.equal(calls.length, 1);
    assert.equal(calls[0][0], 'event');
    assert.equal(calls[0][1], 'conversion');
    assert.equal(calls[0][2].send_to, 'AW-18476545759/6DdaCP7gvY0dEN_tpupE');
});

async function submit(outcome, tracking = true) {
    let callback;
    const calls = [];
    const button = { disabled: false, innerHTML: 'Send Enquiry' };
    const success = { hidden: true };
    const error = { hidden: true };
    const form = {
        addEventListener: (_, fn) => { callback = fn; },
        querySelector: () => button,
        reset() { this.resetCalled = true; }
    };
    const context = {
        document: { getElementById: id => ({ contactForm: form, formSuccess: success, formError: error })[id] },
        FormData: class { get() { return 'test'; } append() {} },
        fetch: async () => { if (outcome === 'network') throw new Error('offline'); return { ok: outcome }; },
        window: {}
    };
    if (tracking) context.window.gtag = (...args) => calls.push(args);
    vm.runInNewContext(script, context);
    assert.equal(calls.length, 0);
    await callback({ preventDefault() {} });
    assert.equal(button.disabled, false);
    return { calls, form, success, error };
}

test('accepted enquiry records exactly one conversion and shows success', async () => {
    const result = await submit(true);
    assert.equal(result.calls.length, 1);
    assert.equal(result.calls[0][0], 'event');
    assert.equal(result.calls[0][1], 'conversion');
    assert.equal(result.calls[0][2].send_to, 'AW-18476545759/YR5DCIv0x40dEN_tpupE');
    assert.equal(result.success.hidden, false);
    assert.equal(result.form.resetCalled, true);
});
for (const outcome of [false, 'network']) {
    test(`failed enquiry (${outcome}) records no conversion and preserves the form`, async () => {
        const result = await submit(outcome);
        assert.equal(result.calls.length, 0);
        assert.equal(result.error.hidden, false);
        assert.equal(result.form.resetCalled, undefined);
    });
}
test('successful enquiry still works when tracking is unavailable', async () => {
    const result = await submit(true, false);
    assert.equal(result.success.hidden, false);
    assert.equal(result.form.resetCalled, true);
});
