import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

export default function Level2Table () {
    return (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {columns[0].map(col=> {
                    return (
                        <TableCell size="small"
                                   sx={col.sx}
                                   rowSpan={col.span_row || 1}
                                   colSpan={col.span_col || 1}>
                          {col.label}
                        </TableCell>
                    );
                })}
              </TableRow>

              <TableRow>
                {columns[1].map(col=> {
                    return (
                        <TableCell size="small"
                                   sx={col.sx}
                                   rowSpan={col.span_row || 1}
                                   colSpan={col.span_col || 1}>
                          {col.label}
                        </TableCell>
                    );
                })}
              </TableRow>
            </TableHead>

            <TableBody>
              {data2.map((row,i)=> {
                  return (
                      <TableRow key={i}>
                        <TableCell size="small">{row.type.ja} ({row.type.en})</TableCell>

                        <TbodyCellValue value={row.start_events.e1}/>
                        <TbodyCellValue value={row.start_events.e2}/>
                        <TbodyCellValue value={row.start_events.e3}/>

                        <TbodyCellValue value={row.intermediate_events.e1}/>
                        <TbodyCellValue value={row.intermediate_events.e2}/>
                        <TbodyCellValue value={row.intermediate_events.e3}/>
                        <TbodyCellValue value={row.intermediate_events.e4}/>

                        <TbodyCellValue value={row.end_events.e1}/>
                      </TableRow>
                  );
              })}
            </TableBody>
          </Table>
        </TableContainer>
    );
}

function TbodyCellValue (props) {
    const val = props.value;

    const sx = {
        textAlign: 'center',
    };

    if (!val)
        sx.background = '#eee';

    return (
        <TableCell sx={sx} size="small">
          {val &&
           <img src={`/bpmn/level2/${val}`}
                alt={val}
                style={{width:22,height:22}}/>}
        </TableCell>
    );
}

const columns = [
    [
        {
            label: 'タイプ',
            span_row: 2,
        },
        {
            label: '開始',
            span_col: 3 ,
        },
        {
            label: '中間',
            span_col: 4 ,
        },
        {
            label: '終了',
            span_row: 2 ,
        },
    ],
    [
        {
            label: <>トップ<br/>レベル</>,
            sx: { whiteSpace: 'nowrap', textAlign: 'center' },
        },
        {
            label: <>イベント<br/>サブプロセス<br/>(中断)</>,
            sx: { whiteSpace: 'nowrap', textAlign: 'center' },
        },
        {
            label: <>イベント<br/>サブプロセス<br/>(非中断)</>,
            sx: { whiteSpace: 'nowrap', textAlign: 'center' },
        },
        {
            label: <>キャッチ</>,
            sx: { whiteSpace: 'nowrap', textAlign: 'center' },
        },
        {
            label: <>境界<br/>(中断)</>,
            sx: { whiteSpace: 'nowrap', textAlign: 'center' },
        },
        {
            label: <>境界<br/>(非中断)</>,
            sx: { whiteSpace: 'nowrap', textAlign: 'center' },
        },
        {
            label: <>フロー</>,
            sx: { whiteSpace: 'nowrap', textAlign: 'center' },
        },
    ]
];

const data2 = [
    {
        type: { ja: 'なし', en: 'None' },
        start_events: {
            e1: 'event-start-none.svg',
            e2: null,
            e3: null,
        },
        intermediate_events: {
            e1: null,
            e2: null,
            e3: null,
            e4: 'event-intermediate-none.svg',
        },
        end_events: {
            e1: 'event-end-none.svg',
        }
    },
    {
        type: { ja: 'メッセージ', en: 'Message' },
        start_events: {
            e1: '?',
            e2: '?',
            e3: '?',
        },
        intermediate_events: {
            e1: '?',
            e2: '?',
            e3: '?',
            e4: '?',
        },
        end_events: {
            e1: '?',
        }
    },
    {
        type: { ja: 'タイマー', en: 'Timer' },
        start_events: {
            e1: '?',
            e2: '?',
            e3: '?',
        },
        intermediate_events: {
            e1: '?',
            e2: '?',
            e3: '?',
            e4: null,
        },
        end_events: {
            e1: null,
        }
    },
    {
        type: { ja: 'エラー', en: 'Error' },
        start_events: {
            e1: null,
            e2: '?',
            e3: null,
        },
        intermediate_events: {
            e1: null,
            e2: '?',
            e3: null,
            e4: null,
        },
        end_events: {
            e1: '?',
        }
    },
    {
        type: { ja: 'エスカレーション', en: 'Escalation' },
        start_events: {
            e1: null,
            e2: '?',
            e3: '?',
        },
        intermediate_events: {
            e1: null,
            e2: '?',
            e3: '?',
            e4: '?',
        },
        end_events: {
            e1: '?',
        }
    },
    {
        type: { ja: 'キャンセル', en: 'Cancel' },
        start_events: {
            e1: null,
            e2: null,
            e3: null,
        },
        intermediate_events: {
            e1: null,
            e2: '?',
            e3: null,
            e4: null,
        },
        end_events: {
            e1: '?',
        }
    },
    {
        type: { ja: '補償', en: 'Compensation' },
        start_events: {
            e1: null,
            e2: '?',
            e3: null,
        },
        intermediate_events: {
            e1: null,
            e2: '?',
            e3: null,
            e4: '?',
        },
        end_events: {
            e1: '?',
        }
    },
    {
        type: { ja: '条件', en: 'Conditional' },
        start_events: {
            e1: '?',
            e2: '?',
            e3: '?',
        },
        intermediate_events: {
            e1: '?',
            e2: '?',
            e3: '?',
            e4: null,
        },
        end_events: {
            e1: null,
        }
    },
    {
        type: { ja: 'リンク', en: 'Link' },
        start_events: {
            e1: null,
            e2: null,
            e3: null,
        },
        intermediate_events: {
            e1: null,
            e2: null,
            e3: null,
            e4: '?',
        },
        end_events: {
            e1: null,
        }
    },
    {
        type: { ja: 'シグナル', en: 'Signal' },
        start_events: {
            e1: '?',
            e2: '?',
            e3: '?',
        },
        intermediate_events: {
            e1: '?',
            e2: '?',
            e3: '?',
            e4: '?',
        },
        end_events: {
            e1: '?',
        }
    },
    {
        type: { ja: '停止', en: 'Terminate' },
        start_events: {
            e1: null,
            e2: null,
            e3: null,
        },
        intermediate_events: {
            e1: null,
            e2: null,
            e3: null,
            e4: null,
        },
        end_events: {
            e1: '?',
        }
    },
    {
        type: { ja: '多重', en: 'Multiple' },
        start_events: {
            e1: '?',
            e2: '?',
            e3: '?',
        },
        intermediate_events: {
            e1: '?',
            e2: '?',
            e3: '?',
            e4: '?',
        },
        end_events: {
            e1: '?',
        }
    },
    {
        type: { ja: '多重パラレル', en: 'Parallel Multiple' },
        start_events: {
            e1: '?',
            e2: '?',
            e3: '?',
        },
        intermediate_events: {
            e1: '?',
            e2: '?',
            e3: '?',
            e4: null,
        },
        end_events: {
            e1: null,
        }
    },
];
