// 代码片段
export default [
  {
    label: 'SELECT_CASE',
    insertText:
      'SELECT\n  CASE\n\tWHEN ${2:CONDITION} THEN "${3:VAR1}"\n\tELSE "${4:VAR2}"\n  END AS ${5:FIELD1},\n  CASE\n\tWHEN ${6:CONDITION} THEN "${7:VAR3}"\n\tELSE "${8:VAR4}"\n  END AS ${9:FIELD1}\nFROM\n  ${1:TABLENAME};\n$0',
    category: 'select',
  },
  {
    label: 'SELECT_ALL',
    insertText: 'SELECT\n  *\nFROM\n  ${1:TABLENAME};',
    category: 'select',
  },
  {
    label: 'S',
    insertText: 'SELECT',
    category: 'select',
  },
  {
    label: 'F',
    insertText: 'FROM',
    category: 'from',
  },
  {
    label: 'W',
    insertText: 'WHERE',
    category: 'where',
  },
  {
    label: 'B',
    insertText: 'BETWEEN ',
    category: 'between',
  },
];
