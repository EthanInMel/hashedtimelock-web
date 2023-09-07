import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { TextField } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs, { Dayjs } from 'dayjs';

import { abi } from '../HashedTimelockETH.json';
import { encodePacked, keccak256, parseEther, stringToHex } from 'viem'
import { useContractWrite } from 'wagmi';

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

export default function CreateModal() {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const [recipient, setrecipient] = React.useState('');
    const [secret, setSecret] = React.useState('');
    const [amount, setAmount] = React.useState(0);
    const [locktime, setValue] = React.useState<Dayjs | null>(dayjs(''));

    const { data, isLoading, isSuccess, write } = useContractWrite({
        address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        abi: abi,
        functionName: 'initiateLock',
        args: [keccak256(encodePacked(['bytes32'], [stringToHex(secret, { size: 32 })])), recipient, locktime?.unix()],
        value: parseEther(amount.toString()),
        onSuccess(data) {
            console.log('Success', data)
            handleClose()
        },
    })

    const onSubmit = async () => {
        console.log(recipient)
        console.log(secret)
        console.log(amount)
        console.log(locktime)
        console.log(locktime?.unix())
        write()
    }

    return (
        <div>
            <Button onClick={handleOpen} variant="contained">Create Lock</Button>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style} flexDirection='column' display='flex' justifyContent='space-around'>
                    <TextField fullWidth label="recipient" value={recipient} onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setrecipient(event.target.value);
                    }} margin="dense" />
                    <TextField fullWidth label="secret" value={secret} margin="dense" onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setSecret(event.target.value);
                    }} />
                    <TextField type="number" label='amount' value={amount} onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setAmount(parseFloat(event.target.value));
                    }} />
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateTimePicker value={locktime} label='lock time' disablePast
                            onChange={(newValue) => setValue(newValue)} />
                    </LocalizationProvider>
                    <Button variant="contained" onClick={onSubmit}>Submit</Button>
                </Box>
            </Modal>
        </div>
    );
}
