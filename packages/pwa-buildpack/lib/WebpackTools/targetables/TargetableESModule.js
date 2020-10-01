const SingleImportStatement = require('./SingleImportStatement');
const TargetableModule = require('./TargetableModule');

/**
 * Presents a convenient API for consumers to add common transforms to ES
 * Modules in a semantic way.
 */
class TargetableESModule extends TargetableModule {
    constructor(...args) {
        super(...args);
        this._imports = new Map();
        this._bindings = new Map();
    }
    addImport(statement) {
        let importStatement =
            statement instanceof SingleImportStatement
                ? statement
                : new SingleImportStatement(statement);
        const existingFromSource = this._imports.get(importStatement.source);
        if (
            existingFromSource &&
            existingFromSource.imported === importStatement.imported
        ) {
            // that's already here, then.
            return existingFromSource;
        }
        if (this._bindings.has(importStatement.binding)) {
            // we have a binding collision. try importing the binding under a
            // different name.
            importStatement = importStatement.changeBinding(
                this.uniqueIdentifier(importStatement.binding)
            );
        }
        this._bindings.set(importStatement.binding, importStatement);
        this._imports.set(importStatement.source, importStatement);
        this.prependSource(importStatement.statement);
        return importStatement;
    }
    uniqueIdentifier(str) {
        TargetableESModule.increment++;
        return `${str}$${TargetableESModule.increment}`;
    }
    /**
     * Pass exports of this module through a [wrapper module](#wrapper_modules).
     *
     * @param {string} [exportName] Name of export to wrap. If not provided, will wrap the default export.
     * @param {string} wrapperModule Import path to the wrapper module. Should be package-absolute.
     */
    wrapWithFile(exportNameOrWrapperModule, wrapperModule) {
        const opts = wrapperModule
            ? {
                  exportName: exportNameOrWrapperModule,
                  wrapperModule,
                  defaultExport: false
              }
            : {
                  wrapperModule: exportNameOrWrapperModule,
                  defaultExport: true
              };
        return this.addTransform(
            'source',
            '@magento/pwa-buildpack/lib/WebpackTools/loaders/wrap-esm-loader',
            opts
        );
    }
}

TargetableESModule.increment = 0;

module.exports = TargetableESModule;
