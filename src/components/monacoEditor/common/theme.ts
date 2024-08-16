/**
 * monaco编辑器主题
 */

/* -------------------------------- 浅色主题 Begin ------------------------------ */
export const wdLight = {
  base: 'vs',
  inherit: false,
  rules: [
    { token: '', foreground: '000000', background: 'fffffe' },
    { token: 'invalid', foreground: 'cd3131' },
    { token: 'emphasis', fontStyle: 'italic' },
    { token: 'strong', fontStyle: 'bold' },

    { token: 'variable', foreground: '001188' },
    { token: 'variable.predefined', foreground: '4864AA' },
    { token: 'constant', foreground: 'dd0000' },
    { token: 'comment', foreground: '008000' },
    { token: 'number', foreground: '098658' },
    { token: 'number.hex', foreground: '3030c0' },
    { token: 'regexp', foreground: '800000' },
    { token: 'annotation', foreground: '808080' },
    { token: 'type', foreground: '008080' },

    { token: 'delimiter', foreground: '000000' },
    { token: 'delimiter.html', foreground: '383838' },
    { token: 'delimiter.xml', foreground: '0000FF' },

    { token: 'tag', foreground: '800000' },
    { token: 'tag.id.pug', foreground: '4F76AC' },
    { token: 'tag.class.pug', foreground: '4F76AC' },
    { token: 'meta.scss', foreground: '800000' },
    { token: 'metatag', foreground: 'e00000' },
    { token: 'metatag.content.html', foreground: 'FF0000' },
    { token: 'metatag.html', foreground: '808080' },
    { token: 'metatag.xml', foreground: '808080' },
    { token: 'metatag.php', fontStyle: 'bold' },

    { token: 'key', foreground: '863B00' },
    { token: 'string.key.json', foreground: 'A31515' },
    { token: 'string.value.json', foreground: '0451A5' },

    { token: 'attribute.name', foreground: 'FF0000' },
    { token: 'attribute.value', foreground: '0451A5' },
    { token: 'attribute.value.number', foreground: '098658' },
    { token: 'attribute.value.unit', foreground: '098658' },
    { token: 'attribute.value.html', foreground: '0000FF' },
    { token: 'attribute.value.xml', foreground: '0000FF' },

    { token: 'string', foreground: 'A31515' },
    { token: 'string.html', foreground: '0000FF' },
    { token: 'string.sql', foreground: 'FF0000' },
    { token: 'string.yaml', foreground: '0451A5' },

    { token: 'keyword', foreground: '0000FF' },
    { token: 'keyword.json', foreground: '0451A5' },
    { token: 'keyword.flow', foreground: 'AF00DB' },
    { token: 'keyword.flow.scss', foreground: '0000FF' },

    { token: 'operator.scss', foreground: '666666' },
    { token: 'operator.sql', foreground: '778899' },
    { token: 'operator.swift', foreground: '666666' },
    { token: 'predefined.sql', foreground: 'C700C7' },

    /** 日志自定义关键字颜色 */
    { token: 'log-text', foreground: '444444' },
    { token: 'log-info', foreground: '03C316' },
    { token: 'log-debug', foreground: 'AAAAAA' },
    { token: 'log-error', foreground: 'e54545', fontStyle: 'bold' },
    { token: 'log-notice', foreground: 'ff9d00', fontStyle: 'bold' },
    { token: 'log-date', foreground: '008000', fontStyle: 'bold' },
    { token: 'log-tip', background: 'fbffbc', foreground: '0000ff', fontStyle: 'italic' },
  ],
  colors: {
    /** 编辑器背景色 */
    'editor.background': '#FFFFFE',
    /** 编辑器前景色 */
    'editor.foreground': '#000000',
    /** 内容选中背景色 */
    'editor.inactiveSelectionBackground': '#E5EBF1',
    /** 缩进参考线背景色 */
    'editorIndentGuide.background1': '#D3D3D3',
    /** 缩进参考线背景色（激活时，即光标位于此区域） */
    'editorIndentGuide.activeBackground1': '#939393',
    /** 与当前选中文本匹配的其他项背景色 */
    'editor.selectionHighlightBackground': '#ADD6FF4D',
    /** 行号前景色 */
    'editorLineNumber.foreground': '#00000066',
    /** 选中行号前景色 */
    'editorLineNumber.activeForeground': '#000000',
    /** minmap背景色 */
    'minimap.background': '#F3F4F7',
    /** 滚动条背景色 */
    'scrollbarSlider.background': '#64646499',
    /** 鼠标hover时的滚动条背景色 */
    'scrollbarSlider.hoverBackground': '#646464aa',
    /** 鼠标点击时的滚动条背景色 */
    'scrollbarSlider.activeBackground': '#646464cc',
    /** 右键菜单背景色 */
    'menu.background': '#FFFFFF',
    /** 右键菜单前景色 */
    'menu.foreground': '#000000E5',
    /** 右键菜单选中项背景色 */
    'menu.selectionBackground': '#F3F4F7',
    /** 右键菜单选中项前景色 */
    'menu.selectionForeground': '#000000E5',
    /** 右键菜单边框色 */
    'menu.border': '#CFD5DE',
    /** 右键菜单分隔线色 */
    'menu.separatorBackground': '#CFD5DE',
    /** 匹配括号的背景色 */
    'editorBracketMatch.background': '#7fb7ff',
    /** 匹配括号的边框色 */
    'editorBracketMatch.border': '#7fb7ff',
    /** 自动补全提示项的背景色 */
    'editorSuggestWidget.selectedBackground': '#009688c6',
    /** 自动补全提示的背景色 */
    'editorSuggestWidget.background': '#FFFFFF',
    /** 自动补全提示的边框色 */
    'editorSuggestWidget.border': '#CFD5DE',
    /** 自动补全提示项选中时关键字匹配字符的高亮色 */
    'editorSuggestWidget.focusHighlightForeground': '#0058df',
    /** 列表/树鼠标悬停在项目上时的背景色 */
    'list.hoverBackground': '#f3f4f7',
    /** Find/Replace背景色 */
    'editorWidget.background': '#FFFFFF',
    /** Find/Replace前景色 */
    'editorWidget.foreground': '#000000A8',
    /** 输入框背景色 */
    'input.background': '#f3f4f7',
    /** icon背景色 */
    'symbolIcon.functionForeground': '#00000066',
    'symbolIcon.constructorForeground': '#00000066',
    'symbolIcon.enumeratorForeground': '#00000066',
    'symbolIcon.textForeground': '#00000066',
  },
};
/* -------------------------------- 浅色主题 End -------------------------------- */

/* -------------------------------- 深色主题 Begin ------------------------------ */
export const wdDark = {
  base: 'vs-dark',
  inherit: false,
  rules: [
    { token: '', foreground: 'D4D4D4', background: '1E1E1E' },
    { token: 'invalid', foreground: 'f44747' },
    { token: 'emphasis', fontStyle: 'italic' },
    { token: 'strong', fontStyle: 'bold' },

    { token: 'variable', foreground: '74B0DF' },
    { token: 'variable.predefined', foreground: '4864AA' },
    { token: 'variable.parameter', foreground: '9CDCFE' },
    { token: 'constant', foreground: '569CD6' },
    { token: 'comment', foreground: '608B4E' },
    { token: 'number', foreground: 'B5CEA8' },
    { token: 'number.hex', foreground: '5BB498' },
    { token: 'regexp', foreground: 'B46695' },
    { token: 'annotation', foreground: 'cc6666' },
    { token: 'type', foreground: '3DC9B0' },

    { token: 'delimiter', foreground: 'DCDCDC' },
    { token: 'delimiter.html', foreground: '808080' },
    { token: 'delimiter.xml', foreground: '808080' },

    { token: 'tag', foreground: '569CD6' },
    { token: 'tag.id.pug', foreground: '4F76AC' },
    { token: 'tag.class.pug', foreground: '4F76AC' },
    { token: 'meta.scss', foreground: 'A79873' },
    { token: 'meta.tag', foreground: 'CE9178' },
    { token: 'metatag', foreground: 'DD6A6F' },
    { token: 'metatag.content.html', foreground: '9CDCFE' },
    { token: 'metatag.html', foreground: '569CD6' },
    { token: 'metatag.xml', foreground: '569CD6' },
    { token: 'metatag.php', fontStyle: 'bold' },

    { token: 'key', foreground: '9CDCFE' },
    { token: 'string.key.json', foreground: '9CDCFE' },
    { token: 'string.value.json', foreground: 'CE9178' },

    { token: 'attribute.name', foreground: '9CDCFE' },
    { token: 'attribute.value', foreground: 'CE9178' },
    { token: 'attribute.value.number.css', foreground: 'B5CEA8' },
    { token: 'attribute.value.unit.css', foreground: 'B5CEA8' },
    { token: 'attribute.value.hex.css', foreground: 'D4D4D4' },

    { token: 'string', foreground: 'CE9178' },
    { token: 'string.sql', foreground: 'FF0000' },

    { token: 'keyword', foreground: '569CD6' },
    { token: 'keyword.flow', foreground: 'C586C0' },
    { token: 'keyword.json', foreground: 'CE9178' },
    { token: 'keyword.flow.scss', foreground: '569CD6' },

    { token: 'operator.scss', foreground: '909090' },
    { token: 'operator.sql', foreground: '778899' },
    { token: 'operator.swift', foreground: '909090' },
    { token: 'predefined.sql', foreground: 'FF00FF' },

    /** 日志自定义关键字颜色 */
    { token: 'log-text', foreground: 'bbbbbb' },
    { token: 'log-info', foreground: '03C316' },
    { token: 'log-debug', foreground: 'AAAAAA' },
    { token: 'log-error', foreground: 'e54545', fontStyle: 'bold' },
    { token: 'log-notice', foreground: 'ff9d00', fontStyle: 'bold' },
    { token: 'log-date', foreground: '008000', fontStyle: 'bold' },
    { token: 'log-tip', background: 'fbffbc', foreground: '0000ff', fontStyle: 'italic' },
  ],
  colors: {
    /** 编辑器背景色 */
    'editor.background': '#11141B',
    /** 编辑器前景色 */
    'editor.foreground': '#D4D4D4',
    /** 内容选中背景色 */
    'editor.inactiveSelectionBackground': '#3A3D41',
    /** 缩进参考线背景色 */
    'editorIndentGuide.background1': '#404040',
    /** 缩进参考线背景色（激活时，即光标位于此区域） */
    'editorIndentGuide.activeBackground1': '#707070',
    /** 与当前选中文本匹配的其他项背景色 */
    'editor.selectionHighlightBackground': '#ADD6FF26',
    /** 行号前景色 */
    'editorLineNumber.foreground': '#FFFFFF66',
    /** 选中行号前景色 */
    'editorLineNumber.activeForeground': '#FFFFFF',
    /** minmap背景色 */
    'minimap.background': '#171B24',
    /** 滚动条背景色 */
    'scrollbarSlider.background': '#79797999',
    /** 鼠标hover时的滚动条背景色 */
    'scrollbarSlider.hoverBackground': '#797979aa',
    /** 鼠标点击时的滚动条背景色 */
    'scrollbarSlider.activeBackground': '#797979cc',
    /** 右键菜单背景色 */
    'menu.background': '#1B2029',
    /** 右键菜单前景色 */
    'menu.foreground': '#FFFFFFB8',
    /** 右键菜单选中项背景色 */
    'menu.selectionBackground': '#2E3340',
    /** 右键菜单选中项前景色 */
    'menu.selectionForeground': '#FFFFFFB8',
    /** 右键菜单边框色 */
    'menu.border': '#373D4C',
    /** 右键菜单分隔线色 */
    'menu.separatorBackground': '#373D4C',
    /** 匹配括号的背景色 */
    'editorBracketMatch.background': '#275da7',
    /** 匹配括号的边框色 */
    'editorBracketMatch.border': '#275da7',
    /** 自动补全提示项选中时的背景色 */
    'editorSuggestWidget.selectedBackground': '#009688e6',
    /** 自动补全提示的背景色 */
    'editorSuggestWidget.background': '#1B2029',
    /** 自动补全提示的边框色 */
    'editorSuggestWidget.border': '#373D4C',
    /** 列表/树鼠标悬停在项目上时的背景色 */
    'list.hoverBackground': '#2e3340',
    /** Find/Replace背景色 */
    'editorWidget.background': '#1b2029',
    /** Find/Replace前景色 */
    'editorWidget.foreground': '#FFFFFF66',
    /** 输入框背景色 */
    'input.background': '#232832',
    /** icon背景色 */
    'symbolIcon.functionForeground': '#ffffff66',
    'symbolIcon.constructorForeground': '#ffffff66',
    'symbolIcon.enumeratorForeground': '#ffffff66',
    'symbolIcon.textForeground': '#ffffff66',
  },
};
/* -------------------------------- 深色主题 End ------------------------------ */
