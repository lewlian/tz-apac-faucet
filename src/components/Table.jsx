import { useState } from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import { useTheme, ThemeProvider, createTheme } from '@mui/material/styles';
import { formatDate, hideWord } from '../utils';

const columns = [
  { id: 'address', label: 'Address', minWidth: 250 },
  { id: 'twitter', label: 'Twitter', minWidth: 100 },
  { id: 'timestamp', label: 'Timestamp', minWidth: 100 },
];

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#1e1e1e',
    color: 'white',
    fontWeight: 800,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    color: theme.palette.common.white,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: '#2a4d88',
  },
  '&:nth-of-type(even)': {
    backgroundColor: '#2a4d88',
  },

  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

function TablePaginationActions(props) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label='first page'
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label='previous page'
      >
        {theme.direction === 'rtl' ? (
          <KeyboardArrowRight />
        ) : (
          <KeyboardArrowLeft />
        )}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label='next page'
      >
        {theme.direction === 'rtl' ? (
          <KeyboardArrowLeft />
        ) : (
          <KeyboardArrowRight />
        )}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label='last page'
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};

const BasicTable = ({ data }) => {
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);

	const walletData = data;

	// Avoid a layout jump when reaching the last page with empty walletData.
	const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - walletData.length) : 0;

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	return (
		<ThemeProvider theme={darkTheme}>
			<TableContainer component={Paper}>
				<Table sx={{ minWidth: 650 }} aria-label="simple table">
					<TableHead>
						<StyledTableRow>
							<StyledTableCell>ADDRESS</StyledTableCell>
							<StyledTableCell align="right">TWITTER</StyledTableCell>
							<StyledTableCell align="right">TIMESTAMP</StyledTableCell>
						</StyledTableRow>
					</TableHead>
					<TableBody>
						{(rowsPerPage > 0 ? walletData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : walletData).map((row) => (
							<StyledTableRow key={row.address} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
								{columns.map((column) => {
									const value = row[column.id];
									return (
										<StyledTableCell key={column.id} align={column.align}>
											{column.id === 'timestamp' ? formatDate(value) : column.id === 'address' ? hideWord(value) : value}
										</StyledTableCell>
									);
								})}
							</StyledTableRow>
						))}

						{emptyRows > 0 && (
							<StyledTableRow style={{ height: 53 * emptyRows }}>
								<StyledTableCell colSpan={6} />
							</StyledTableRow>
						)}
					</TableBody>
					<TableFooter>
						<TableRow>
							<TablePagination
								rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
								colSpan={3}
								count={walletData.length}
								rowsPerPage={rowsPerPage}
								page={page}
								SelectProps={{
									inputProps: {
										'aria-label': 'walletData per page',
									},
									native: true,
								}}
								onPageChange={handleChangePage}
								onRowsPerPageChange={handleChangeRowsPerPage}
								ActionsComponent={TablePaginationActions}
								backIconButtonProps={{
									'aria-label': 'Previous Page',
									style: { color: '#2d5cec' },
									autoid: 'pagination-button-next-collector',
								}}
								nextIconButtonProps={{
									'aria-label': 'Next Page',
									style: { color: '#2d5cec' },
									autoid: 'pagination-button-next-collector',
								}}
							/>
						</TableRow>
					</TableFooter>
				</Table>
			</TableContainer>
		</ThemeProvider>
	);
};

export default BasicTable;
