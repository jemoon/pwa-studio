const SingleImportStatement = require('./SingleImportStatement');
const TargetableESModule = require('./TargetableESModule');

class TargetableESModuleObject extends TargetableESModule {
    constructor(...args) {
        super(...args);
        this._errors = [];
    }
    flush() {
        if (this._bindings.size > 0) {
            this._queuedTransforms.push(
                this._createTransform(
                    'source',
                    '@magento/pwa-buildpack/lib/WebpackTools/loaders/export-esm-collection-loader',
                    {
                        type: 'object',
                        bindings: [...this._bindings.keys()],
                        errors: this._errors
                    }
                )
            );
        }
        return super.flush().reverse();
    }
    addImport(importString) {
        const importStatement = new SingleImportStatement(importString);
        const alreadyBound = this._bindings.get(importStatement.binding);
        if (alreadyBound) {
            this._errors.push(
                `Cannot export "${importStatement.imported}" as "${
                    importStatement.binding
                }" from "${importStatement.source}". Export "${
                    importStatement.binding
                }" was already assigned to "${alreadyBound.imported}" from "${
                    alreadyBound.source
                }".`
            );
        } else {
            super.addImport(importStatement);
        }
        return this;
    }
    add(...args) {
        args.forEach(arg => this.addImport(arg));
        return this;
    }
}

module.exports = TargetableESModuleObject;
