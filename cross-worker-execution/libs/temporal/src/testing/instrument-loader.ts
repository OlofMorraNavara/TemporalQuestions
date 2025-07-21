import * as convert from 'convert-source-map';
import { createInstrumenter } from 'istanbul-lib-instrument';
import type { LoaderDefinitionFunction } from 'webpack';

const instrumentLoader: LoaderDefinitionFunction = function (source, sourceMap: any): void {
    let srcMap = sourceMap ?? convert.fromSource(source)?.sourcemap;
    if (typeof srcMap === 'string') srcMap = JSON.parse(srcMap);

    const instrumenter = createInstrumenter({
        esModules: true,
        produceSourceMap: true,
    });

    instrumenter.instrument(
        source,
        this.resourcePath,
        (error, instrumentedSource) => {
            this.callback(error, instrumentedSource, instrumenter.lastSourceMap() as any);
        },
        srcMap
    );
};

export default instrumentLoader;
