'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import dayjs, { Dayjs } from 'dayjs';
import Modal from '@mui/material/Modal';
import { TextField } from '@mui/material';

import { abi } from '../HashedTimelockETH.json';
import { bytesToHex, encodePacked, formatEther, keccak256, parseEther, stringToBytes, stringToHex, toBytes } from 'viem'
import { useAccount, useContractRead, useContractWrite, useSwitchNetwork } from 'wagmi';

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

export default function LockTable() {
    const [showChild, setShowChild] = React.useState(false);
    React.useEffect(() => {
        setShowChild(true);
    }, []);
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const [recipient, setrecipient] = React.useState('');
    const [secret, setSecret] = React.useState('');
    const [amount, setAmount] = React.useState(0);
    const [locktime, setValue] = React.useState<Dayjs | null>(dayjs(''));

    const [curLock, setCurLock] = React.useState(null);

    const { address, isConnecting, isDisconnected } = useAccount();
    const { chains, error, isLoading, pendingChainId, switchNetwork } = useSwitchNetwork({
        onSuccess(data) {
            console.log('Success', data)
            initLoct()
        },
    });
    const { data, isSuccess } = useContractRead({
        address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        abi: abi,
        functionName: 'getLocks',
        watch: true,
    })

    console.log(data)
    console.log(curLock)

    const onSubmit = async () => {
        console.log(recipient)
        console.log(secret)
        console.log(amount)
        console.log(locktime)
        console.log(locktime?.unix())
    }


    const { write: initLoct } = useContractWrite({
        address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        abi: abi,
        functionName: 'initiateLock',
        args: [curLock?.hashedSecret, curLock?.sender, curLock?.lockTime?.toString()],
        value: curLock?.amount?.toString(),
    })

    const getLockId = () => {
        let lockId = ''
        if (curLock) {
            lockId = keccak256(encodePacked(['address', 'address', 'uint256', 'uint256', 'bytes32'], [curLock?.sender, curLock?.recipient, curLock?.amount?.toString(), curLock?.lockTime?.toString(), curLock?.hashedSecret]))
        }
        console.log(lockId)
        console.log(bytesToHex(stringToBytes(secret, { size: 32 })))
        return lockId
    }

    const { write: claim } = useContractWrite({
        address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        abi: abi,
        functionName: 'claim',
        args: [getLockId(), bytesToHex(stringToBytes(secret, { size: 32 }))],
        onSuccess(data) {
            handleClose()
        }
    })



    const onClaim = async (lock: any) => {
        setCurLock(lock)
        handleOpen();
    }

    const onClaimWrite = () => {
        if (secret)
            claim?.()
    }


    const onAccept = async (lock: any) => {
        console.log(lock)
        setCurLock(lock)
        switchNetwork?.(31_338)
        console.log(recipient)
        console.log(secret)
        console.log(amount)
        console.log(locktime)
        console.log(locktime?.unix())
    }

    return (
        <div>
            {showChild && (
                <TableContainer component={Paper}>
                    <>
                        {(isSuccess && data.length != 0) && (
                            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Sender</TableCell>
                                        <TableCell align="left">Recipient</TableCell>
                                        <TableCell align='left'>Amount</TableCell>
                                        <TableCell align="left">Locked Time</TableCell>
                                        <TableCell align="left">Hashed Secret</TableCell>
                                        <TableCell align="left">Action</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {
                                        data.map((row, index) => (
                                            <TableRow
                                                key={index}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell component="th" scope="row">
                                                    {row.sender}
                                                </TableCell>
                                                <TableCell align="left">{row.recipient}</TableCell>
                                                <TableCell align="left">{formatEther(row.amount)}</TableCell>
                                                <TableCell align="left">{new Date(Number(row.lockTime) * 1000).toLocaleString()}</TableCell>
                                                <TableCell align="left">{row.hashedSecret}</TableCell>
                                                <TableCell align="left">
                                                    <Button disabled={address !== row.recipient && row.state == 1} onClick={() => onAccept(row)}>Accept </Button>
                                                    <Button disabled={address !== row.recipient && row.state == 1} onClick={() => onClaim(row)}>Claim</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    }


                                </TableBody>

                            </Table>
                        )}
                    </>
                </TableContainer>
            )}
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style} flexDirection='column' display='flex' justifyContent='space-around'>
                    <TextField fullWidth label="secret" value={secret} margin="dense" onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setSecret(event.target.value);
                    }} />
                    <Button variant="contained" onClick={onClaimWrite}>Submit</Button>
                </Box>
            </Modal>
        </div>
    );
}
