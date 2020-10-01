const TargetableESModule = require('./TargetableESModule');

class TargetableESModuleArray extends TargetableESModule {
    constructor(...args) {
        super(...args);
        this._orderedBindings = [];
        this._bindingsSet = new Set();
    }
    addImport(importString) {
        return this.push(importString);
    }
    add(...items) {
        return this.push(...items);
    }
    push(...items) {
        return this._forEachBinding(items, item =>
            this._orderedBindings.push(item)
        );
    }
    unshift(...items) {
        return this._forEachBinding(items, item =>
            this._orderedBindings.unshift(item)
        );
    }
    _forEachBinding(items, callback) {
        for (const item of items) {
            const generated = super.addImport(item);
            if (this._bindingsSet.has(generated)) {
                this._orderedBindings.splice(
                    this._orderedBindings.indexOf(generated),
                    1
                );
                // change its position
            } else {
                this._bindingsSet.add(generated);
            }
            callback(generated.binding);
        }
        return this;
    }
    flush() {
        if (this._bindings.size > 0) {
            this._queuedTransforms.unshift(
                this._createTransform(
                    'source',
                    '@magento/pwa-buildpack/lib/WebpackTools/loaders/export-esm-collection-loader',
                    {
                        type: 'array',
                        bindings: this._orderedBindings
                    }
                )
            );
        }
        return super.flush();
    }
}

module.exports = TargetableESModuleArray;
