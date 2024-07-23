// 代码片段
export default [
  {
    label: 'SELECT_CASE',
    value: 'SELECT\n\tCASE\n\t\tWHEN ${2:CONDITION} THEN \'${3:VAR1}\'\n\t\tELSE \'${4:VAR2}\'\n\tEND AS ${5:FIELD1},\n\tCASE\n\t\tWHEN ${6:CONDITION} THEN \'${7:VAR3}\'\n\t\tELSE \'${8:VAR4}\'\n\tEND AS ${9:FIELD1}\nFROM\n\t${1:TABLENAME};\n$0',
  },
  {
    label: 'SELECT_ALL',
    value: 'SELECT\n\t*\nFROM\n\t${1:TABLENAME};',
  },
];
