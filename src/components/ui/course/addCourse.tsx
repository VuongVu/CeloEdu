import { memo, useState } from 'react';

import BN from 'bn.js';
import { useContractKit } from '@celo-tools/use-contractkit';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';

import type { CeloEduMarketplace } from 'abis/types';
import { CELO_EDU_MARKETPLACE_CONTRACT_ADDRESS } from 'constants/contracts';
import CELO_EDU_MARKETPLACE_ABI from 'abis/celo-edu-marketplace.json';

import getErrorMessage from 'utils/getErrorMessage';
import { useNotify } from 'components/base/notify/hooks';
import useContract from 'hooks/useContract';

import type { Course } from './types';

interface AddCourseProps {
    open: boolean;
    onClose: () => void;
    onGetAllCourses: () => void;
}

type FormData = Omit<Course, 'index' | 'owner' | 'sold' | 'learners'>;

const schema = yup
    .object({
        title: yup.string().required(),
        description: yup.string().required(),
        author: yup.string().required(),
        image: yup.string().required(),
        price: yup.number().positive().required(),
    })
    .required();

const AddCourse = memo(({ open, onClose, onGetAllCourses }: AddCourseProps) => {
    const { register, handleSubmit, reset } = useForm<FormData>({
        resolver: yupResolver(schema),
    });

    const { openNotify } = useNotify();

    const { kit } = useContractKit();

    const marketPlaceContract = useContract<CeloEduMarketplace>(
        CELO_EDU_MARKETPLACE_ABI,
        CELO_EDU_MARKETPLACE_CONTRACT_ADDRESS,
    );

    const [loading, setLoading] = useState<boolean>(false);

    const handleFormSubmit: SubmitHandler<FormData> = async data => {
        try {
            if (!marketPlaceContract) return;

            const { title, description, author, image, price } = data;

            setLoading(true);
            await marketPlaceContract.methods
                .addCourse(title, description, author, image, new BN(price))
                .send({ from: kit.defaultAccount });

            openNotify({ message: `Successfully added new course ${title}`, type: 'success' });
            onClose();
            reset();
            onGetAllCourses();
        } catch (error) {
            openNotify({ message: getErrorMessage(error), type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal hideBackdrop open={open} onClose={onClose}>
            <Box
                component="form"
                onSubmit={handleSubmit(handleFormSubmit)}
                sx={{
                    width: 500,
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%,-50%)',
                    bgcolor: 'background.paper',
                    padding: 4,
                    boxShadow: 24,
                }}>
                <IconButton disabled={loading} sx={{ display: 'flex', marginLeft: 'auto' }} onClick={onClose}>
                    <CloseOutlinedIcon />
                </IconButton>
                <Typography variant="h6" textAlign="center" sx={{ mb: 2 }}>
                    Add New Course
                </Typography>
                <Stack direction="column" gap={2}>
                    <TextField required fullWidth label="Title" {...register('title')} />
                    <TextField fullWidth label="Description" {...register('description')} />
                    <TextField fullWidth label="Author" {...register('author')} />
                    <TextField fullWidth label="Image url" {...register('image')} />
                    <TextField
                        required
                        fullWidth
                        type="number"
                        inputProps={{ inputMode: 'decimal', min: 0, step: 0.1 }}
                        onKeyDown={e => {
                            if (e.key === '-' || e.key === '+') {
                                e.preventDefault();
                            }
                        }}
                        label="Price"
                        {...register('price')}
                    />
                </Stack>
                <LoadingButton loading={loading} type="submit" variant="outlined" fullWidth size="large" sx={{ mt: 2 }}>
                    Submit
                </LoadingButton>
            </Box>
        </Modal>
    );
});

AddCourse.displayName = 'AddCourse';

export default AddCourse;
