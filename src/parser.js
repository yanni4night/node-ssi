/**
 * Copyright (C) 2016 tieba.baidu.com
 * parser.js
 *
 * changelog
 * 2016-04-17[11:36:17]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */
import * as lexer from './lexer';
import * as utils from './utils';

const _t = lexer.TYPES;
const _reserved = 'include,block,endblock,echo,if,endif,set,file,virtual'.split(',');

/*!
 * Makes a string safe for a regular expression.
 * @param  {string} str
 * @return {string}
 * @private
 */
function escapeRegExp(str) {
    return str.replace(/[\-\/\\\^$*+?.()|\[\]{}]/g, '\\$&');
}

class TokenParser {

    constructor(tokens, line, filename) {
        this.out = [];
        this.state = [];
        this._parsers = {};
        this.line = line;
        this.filename = filename;
    }

    parse() {

        if (this._parsers.start) {
            this._parsers.start.call(this);
        }
        utils.each(tokens, (token, i) => {
            var prevToken = tokens[i - 1];
            this.isLast = (i === tokens.length - 1);
            if (prevToken) {
                while (prevToken.type === _t.WHITESPACE) {
                    i -= 1;
                    prevToken = tokens[i - 1];
                }
            }
            this.prevToken = prevToken;
            this.parseToken(token);
        });
        if (this._parsers.end) {
            this._parsers.end.call(this);
        }

        return this.out;
    }

    on(type, fn) {
        this._parsers[type] = fn;
    }

    parseToken(token) {
        var self = this,
            fn = self._parsers[token.type] || self._parsers['*'],
            match = token.match,
            prevToken = self.prevToken,
            prevTokenType = prevToken ? prevToken.type : null,
            lastState = (self.state.length) ? self.state[self.state.length - 1] : null,
            temp;

        if (fn && typeof fn === 'function') {
            if (!fn.call(this, token)) {
                return;
            }
        }

        switch (token.type) {
        case _t.WHITESPACE:
            break;

        case _t.STRING:
            this.out.push(match.replace(/\\/g, '\\\\'));
            break;

        case _t.VAR:
            this.parseVar(token, match, lastState);
            break;
        }
    }

    parseVar(token, match, lastState) {

        match = match.split('.');

        if (_reserved.indexOf(match[0]) !== -1) {
            utils.throwError('Reserved keyword "' + match[0] + '" attempted to be used as a variable', self.line,
                this.filePath);
        }

        this.out.push(this.checkMatch(match));
    }

    checkMatch(match) {
        var temp = match[0],
            result;

        function checkDot(ctx) {
            var c = ctx + temp,
                m = match,
                build = '';

            build = '(typeof ' + c + ' !== "undefined" && ' + c + ' !== null';
            utils.each(m, function (v, i) {
                if (i === 0) {
                    return;
                }
                build += ' && ' + c + '.' + v + ' !== undefined && ' + c + '.' + v + ' !== null';
                c += '.' + v;
            });
            build += ')';

            return build;
        }

        function buildDot(ctx) {
            return '(' + checkDot(ctx) + ' ? ' + ctx + match.join('.') + ' : "")';
        }
        result = '(' + checkDot('_ctx.') + ' ? ' + buildDot('_ctx.') + ' : ' + buildDot('') + ')';
        return '(' + result + ' !== null ? ' + result + ' : ' + '"" )';
    }
};


export const parse = (ssi, source, opts, tags) => {
    source = source.replace(/\r\n/g, '\n');
    var escape = opts.autoescape,
        tagOpen = opts.tagControls[0],
        tagClose = opts.tagControls[1],
        escapedTagOpen = escapeRegExp(tagOpen),
        escapedTagClose = escapeRegExp(tagClose),
        anyChar = '[\\s\\S]*?',
        tagStrip = new RegExp('^' + escapedTagOpen + '-?\\s*-?|-?\\s*-?' + escapedTagClose + '$', 'g'),
        // Split the template source based on variable, tag, and comment blocks
        // /(\{%[\s\S]*?%\}|\{\{[\s\S]*?\}\}|\{#[\s\S]*?#\})/
        splitter = new RegExp('(' + escapedTagOpen + anyChar + escapedTagClose + ')'),
        line = 1,
        stack = [],
        parent = null,
        tokens = [],
        blocks = {};

    /**
     * Parse a variable.
     * @param  {string} str  String contents of the variable, between <i>{{</i> and <i>}}</i>
     * @param  {number} line The line number that this variable starts on.
     * @return {VarToken}      Parsed variable token object.
     * @private
     */
    function parseVariable(str, line) {
        var tokens = lexer.read(utils.strip(str)),
            parser,
            out;

        parser = new TokenParser(tokens, line, opts.filePath);
        out = parser.parse().join('');

        if (parser.state.length) {
            utils.throwError('Unable to parse "' + str + '"', line, opts.filePath);
        }

        /**
         * A parsed variable token.
         * @typedef {object} VarToken
         * @property {function} compile Method for compiling this token.
         */
        return {
            compile: () => '_output += ' + out + ';\n'
        };
    }

    const parseTag = (str, line) => {
        var tokens, parser, chunks, tagName, tag, args, last;

        if (utils.startsWith(str, 'end')) {
            last = stack[stack.length - 1];
            if (last && last.name === str.split(/\s+/)[0].replace(/^end/, '') && last.ends) {
                stack.pop();
                return;
            }
        }

        chunks = str.split(/\s+(.+)?/);
        tagName = chunks.shift();

        if (!tags.hasOwnProperty(tagName)) {
            utils.throwError('Unexpected tag "' + str + '"', line, opts.filePath);
        }

        tokens = lexer.read(utils.strip(chunks.join(' ')));
        parser = new TokenParser(tokens, line, opts.filePath);
        tag = tags[tagName];

        if (!tag.parse(chunks[1], line, parser, _t, stack, opts, ssi)) {
            utils.throwError('Unexpected tag "' + tagName + '"', line, opts.filePath);
        }

        parser.parse();
        args = parser.out;

        return {
            compile: tag.compile,
            args: args,
            content: [],
            ends: tag.ends,
            name: tagName
        };
    };

    /**
     * Strip the whitespace from the previous token, if it is a string.
     * @param  {object} token Parsed token.
     * @return {object}       If the token was a string, trailing whitespace will be stripped.
     */
    function stripPrevToken(token) {
        if (typeof token === 'string') {
            token = token.replace(/\s*$/, '');
        }
        return token;
    }

    /*!
     * Loop over the source, split via the tag/var/comment regular expression splitter.
     * Send each chunk to the appropriate parser.
     */
    utils.each(source.split(splitter), function (chunk) {
        var token, lines, stripPrev, prevToken, prevChildToken;

        if (!chunk) {
            return;
        }

        if (utils.startsWith(chunk, tagOpen) && utils.endsWith(chunk, tagClose)) {
            token = parseTag(chunk.replace(tagStrip, ''), line);
            if (token) {
                if (token.block && !stack.length) {
                    blocks[token.args.join('')] = token;
                }
            }
            // Is a content string?
        } else {
            token = chunk;
        }

        // This was a comment, so let's just keep going.
        if (!token) {
            return;
        }

        // If there's an open item in the stack, add this to its content.
        if (stack.length) {
            stack[stack.length - 1].content.push(token);
        } else {
            tokens.push(token);
        }

        // If the token is a tag that requires an end tag, open it on the stack.
        if (token.name && token.ends) {
            stack.push(token);
        }

        lines = chunk.match(/\n/g);
        line += (lines) ? lines.length : 0;
    });

    return {
        name: opts.filePath,
        parent: parent,
        tokens: tokens,
        blocks: blocks
    };
};


/**
 * Compile an array of tokens.
 * @param  {Token[]} template     An array of template tokens.
 * @param  {Templates[]} parents  Array of parent templates.
 * @param  {SwigOpts} [options]   Swig options object.
 * @param  {string} [blockName]   Name of the current block context.
 * @return {string}               Partial for a compiled JavaScript method that will output a rendered template.
 */
exports.compile = function (template, parents, options, blockName) {
    var out = '',
        tokens = utils.isArray(template) ? template : template.tokens;

    utils.each(tokens, function (token) {
        var o;
        if (typeof token === 'string') {
            out += '_output += "' + token.replace(/\\/g, '\\\\').replace(/\n|\r/g, '\\n').replace(/"/g,
                '\\"') + '";\n';
            return;
        }

        /**
         * Compile callback for VarToken and TagToken objects.
         * @callback compile
         *
         * @example
         * exports.compile = function (compiler, args, content, parents, options, blockName) {
         *   if (args[0] === 'foo') {
         *     return compiler(content, parents, options, blockName) + '\n';
         *   }
         *   return '_output += "fallback";\n';
         * };
         *
         * @param {parserCompiler} compiler
         * @param {array} [args] Array of parsed arguments on the for the token.
         * @param {array} [content] Array of content within the token.
         * @param {array} [parents] Array of parent templates for the current template context.
         * @param {SwigOpts} [options] Swig Options Object
         * @param {string} [blockName] Name of the direct block parent, if any.
         */
        o = token.compile(compile, token.args ? token.args.slice(0) : [], token.content ? token.content
            .slice(0) : [], parents, options, blockName);
        out += o || '';
    });

    return out;
};