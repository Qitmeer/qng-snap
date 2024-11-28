/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-shadow */
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';

export const HISTORYKEY = 'historytxs';

const HistoryTx = () => {
  const [rows, setRows] = useState([]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  useEffect(() => {
    const storedData = localStorage.getItem(HISTORYKEY);
    if (storedData) {
      setRows(JSON.parse(storedData));
    }
  }, []);

  const handleChangePage = (
    event: any,
    newPage: React.SetStateAction<number>,
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: { target: { value: string } }) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const truncateString = (str: string | any[], maxLength: number) => {
    if (str.length > maxLength) {
      return `${str.slice(0, maxLength)}...`;
    }
    return str;
  };
  const formatUTXOs = (utxos: string) => {
    return utxos.replace('-', '<BR>');
  };
  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {[
                'Transaction Hash',
                'Transaction Time',
                'Spent UTXOs',
                'To',
                'Amount',
                'Transaction Fee',
              ].map((header) => (
                <TableCell key={header} align="right">
                  <Typography variant="h6" fontWeight="bold" fontSize="1.3rem">
                    {header}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row: any) => (
                <TableRow key={row.txhash}>
                  <TableCell
                    component="th"
                    scope="row"
                    style={{ fontSize: '1.1rem' }}
                  >
                    <a
                      href={`https://qng.qitmeer.io/tx/${row.txhash}`}
                      target="_blank"
                    >
                      {truncateString(row.txhash, 20)}
                    </a>
                  </TableCell>
                  <TableCell align="right" style={{ fontSize: '1.1rem' }}>
                    {row.txtime}
                  </TableCell>
                  <TableCell align="right" style={{ fontSize: '1.1rem' }}>
                    {formatUTXOs(row.utxos)}
                  </TableCell>
                  <TableCell align="right" style={{ fontSize: '1.1rem' }}>
                    {row.to}
                  </TableCell>
                  <TableCell align="right" style={{ fontSize: '1.1rem' }}>
                    {row.amount} MEER
                  </TableCell>
                  <TableCell align="right" style={{ fontSize: '1.1rem' }}>
                    {row.fee} MEER
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default HistoryTx;
