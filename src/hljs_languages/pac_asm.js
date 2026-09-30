(function (root, factory) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = factory;
    } else if (typeof define === "function" && define.amd) {
        define(function () {return factory;});
    } else {
        root.hljsDefinePacAsm = factory;
    }
}(this, function (hljs) {
    return {
        name: "PAC Assembly",
        aliases: ["pac", "pasm", "pac-asm"],
        case_insensitive: false,

        keywords: {
            keyword: [
                "inst."
            ],

            type: [
                ".byte",
                ".short",
                ".int",
                ".long",
                ".ubyte",
                ".ushort",
                ".uint",
                ".ulong",
                ".ptr",
                ".float",
                ".double"
            ],

            literal: []
        },

        contains: [
			// Comments
            {
                className: "comment",
                begin: "//",
                end: "$",
                contains: [
                    {
                        className: "doctag",
                        begin: "\\b(?:NOTE|ERROR|TODO|FIXME|WARNING|IMPORTANT)\\b"
                    }
                ]
            },
            {
                className: "comment",
                begin: "/\\*",
                end: "\\*/"
            },

			// Preprocessors
            {
                className: "meta",
                begin: "@(?:def|undef|inc)\\b",
                end: "$",
                keywords: {
                    keyword: [
                        "@def",
                        "@undef",
                        "@inc"
                    ]
                }
            },
            {
                className: "meta",
                begin: "@sizeof\\(",
                end: "\\)",
                contains: [
                    {
                        className: "variable",
                        begin: "[$%]?[A-Za-z_][A-Za-z0-9_]*"
                    }
                ]
            },

			// Strings
            {
                className: "string",
                begin: "\"",
                end: "\"",
                contains: [
                    hljs.BACKSLASH_ESCAPE
                ]
            },
            {
                className: "string",
                begin: "'",
                end: "'",
                contains: [
                    hljs.BACKSLASH_ESCAPE
                ]
            },

            // Number LIT
            {
                className: "number",
                begin: "\\b(?:0[xX][0-9A-Fa-f]+|0[bB][01]+|0[oO][0-7]+|[0-9]+(?:\\.[0-9]+)?(?:[eE][+-]?[0-9]+)?)\\b",
                relevance: 0
            },

            // Registers
            {
                className: "variable",
                begin: "%[A-Za-z][A-Za-z0-9_]*",
                relevance: 0
            },

            // Functions
            {
                className: "title.function",
                begin: "\\$[A-Za-z_][A-Za-z0-9_]*(?:\\.[A-Za-z_][A-Za-z0-9_]*)*",
                relevance: 0
            },

            // Global and External
            {
                className: "keyword",
                begin: ":(?:global|external)\\b",
                end: "(?=\\s|$)",
                excludeEnd: true
            },

            // Section stuff + reserve
            {
                className: "keyword",
                begin: ":(?:section|align|start|size|res)\\b",
                relevance: 0
            },

			// Structs, func defs, and typedefs
            {
                className: "keyword",
                begin: "\\.(?:struct|endstruct|type|func|endfunc)\\b",
                relevance: 0
            },

			// Default DIRECTIVE identification is '.' at start
            {
                className: "keyword",
                begin: "\\.[A-Za-z_][A-Za-z0-9_]*",
                relevance: 0
            },

            // Labels
            {
                className: "symbol",
                begin: "\\b[A-Za-z_][A-Za-z0-9_]*\\s*(?=:)",
                relevance: 0
            },

			// Struct members
            {
                className: "variable",
                begin: "\\b[A-Za-z_][A-Za-z0-9_]*\\.[A-Za-z_][A-Za-z0-9_]*\\b",
                relevance: 0
            },

			// Typdefs
            {
                begin: "\\b[A-Za-z_][A-Za-z0-9_]*\\s*!\\s*",
                end: "(?=\\s|=|$)",
                contains: [
                    {
                        className: "variable",
                        begin: "\\b[A-Za-z_][A-Za-z0-9_]*"
                    },
                    {
                        className: "operator",
                        begin: "!"
                    },
                    {
                        className: "type",
                        begin: "\\b(?:byte|short|int|long|ubyte|ushort|uint|ulong|ptr|float|double)\\b"
                    },
                    {
                        className: "meta",
                        begin: "\\[[0-9]*\\]"
                    }
                ],
                relevance: 0
            },

			// Assignment n stuff
            {
                className: "operator",
                begin: "=",
                relevance: 0
            },

            // Grammer stuff
            {
                className: "operator",
                begin: "!"
            },
            {
                className: "punctuation",
                begin: "[\\[\\](),:]"
            },
            {
                className: "operator",
                begin: "(?:\\+|-|\\*|/|%|<<|>>|&|\\||\\^|~|==|!=|<=|>=|<|>)",
                relevance: 0
            },

			// Finally identifiers
            {
                className: "variable",
                begin: "\\b[A-Za-z_][A-Za-z0-9_]*\\b",
                relevance: 0
            }
        ]
    };
}));


// Register language when loaded directly in the browser
if (typeof hljs !== "undefined") {
    hljs.registerLanguage("pac-asm", window.hljsDefinePacAsm);
}