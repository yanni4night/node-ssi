/**
 * Copyright (C) 2016 yanni4night.com
 * ssi.js
 *
 * changelog
 * 2016-03-29[23:49:20]:revised
 *
 * @author yanni4night@gmail.com
 * @version 0.1.0
 * @since 0.1.0
 */
import * as tags from './tags';
import * as loader from './loader';
import path from 'path';
import * as utils from './utils';
import * as parser from './parser';


const SYNTAX_PATTERN = /<!--#([^\r\n]+?)-->/mg;

const noop = () => {};
/**
 * render     →   compile    →    precompile   → [parser.parse/compile]
 *                   ↑
 * renderFile → compileFile 
 */
export class SSI {
    constructor(opts) {
        this.options = Object.assign({
            //baseDir: '.',
            encoding: 'utf-8',
            tagControls: ['<!--#', '-->'],
            locals: {}
        }, opts);
    }
    precompile(source, opts) {
        let options = Object.assign({}, this.options, opts);
        const tokens = parser.parse(this, source, options, tags);
        let tpl;
        try {
            tpl = new Function('_ssi', '_ctx', '_utils', '_fn',
                '  var _output = "";\n' +
                parser.compile(tokens, opts) + '\n' +
                '  return _output;\n'
            );
        } catch (e) {
            utils.throwError(e, null, opts.filePath);
        }

        return tpl;
    }
    compile(source, opts = {}) {
        const tpl = this.precompile(source, opts);
        return (locals => tpl(this, Object.assign({}, opts.locals, this.options.locals), utils, noop));
    }
    compileFile(filePath, opts = {}) {
        const {
            options
        } = this;

        let from;
        
        if (options.baseDir) {
            from = options.baseDir;
        } else {
            from = (opts.resolveFrom) ? path.dirname(opts.resolveFrom) : process.cwd();
        }

        const absFilePath = path.resolve(from, filePath);

        const content = loader.load(absFilePath, {
            encoding: options.encoding
        });

        return this.compile(content, Object.assign({}, opts, {
            filePath: absFilePath
        }));
    }
    render(source, opts) {
        return this.compile(source, opts)();
    }
    renderFile(filePath, locals) {
        return this.compileFile(filePath)(locals);
    }
}