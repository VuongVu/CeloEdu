import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { useContractKit } from '@celo-tools/use-contractkit';

import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import type { CeloEduMarketplace, Erc20 } from 'abis/types';
import { CELO_EDU_MARKETPLACE_CONTRACT_ADDRESS, CUSD_CONTRACT_ADDRESS } from 'constants/contracts';
import CELO_EDU_MARKETPLACE_ABI from 'abis/celo-edu-marketplace.json';
import ERC20_ABI from 'abis/erc20.json';

import { useNotify } from 'components/base/notify/hooks';
import useContract from 'hooks/useContract';
import getErrorMessage from 'utils/getErrorMessage';

import { CourseStatus, type Course } from './types';

interface CourseItemProps {
    course: Course;
    onGetAllCourses: () => Promise<void>;
}

const CourseItem = memo(({ course, onGetAllCourses }: CourseItemProps) => {
    const { openNotify } = useNotify();

    const { kit } = useContractKit();

    const marketPlaceContract = useContract<CeloEduMarketplace>(
        CELO_EDU_MARKETPLACE_ABI,
        CELO_EDU_MARKETPLACE_CONTRACT_ADDRESS,
    );
    const cUSDContract = useContract<Erc20>(ERC20_ABI, CUSD_CONTRACT_ADDRESS);

    const [isBought, setIsBought] = useState<boolean>(false);
    const [isCompleted, setIsCompleted] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const checkCourseIsBought = useCallback(async () => {
        if (!marketPlaceContract) return;

        try {
            const result = await marketPlaceContract.methods
                .isBoughtCourse(course.index)
                .call({ from: kit.defaultAccount });

            setIsBought(result);
        } catch (error) {
            openNotify({ message: getErrorMessage(error), type: 'error' });
        }
    }, [course.index, kit.defaultAccount, marketPlaceContract, openNotify]);

    const checkCourseIsCompleted = useCallback(async () => {
        if (!marketPlaceContract) return;

        try {
            const result = await marketPlaceContract.methods
                .isCompleteCourse(course.index)
                .call({ from: kit.defaultAccount });

            setIsCompleted(result);
        } catch (error) {
            openNotify({ message: getErrorMessage(error), type: 'error' });
        }
    }, [course.index, kit.defaultAccount, marketPlaceContract, openNotify]);

    const approveTransaction = useCallback(
        async (price: number) => {
            if (!cUSDContract) {
                return;
            }

            const approval = await cUSDContract.methods
                .approve(CELO_EDU_MARKETPLACE_CONTRACT_ADDRESS, price)
                .send({ from: kit.defaultAccount });

            return approval;
        },
        [cUSDContract, kit.defaultAccount],
    );

    const handleBuyCourse = useCallback(
        async (course: Course) => {
            if (!marketPlaceContract || !kit.defaultAccount) {
                return;
            }

            try {
                setLoading(true);

                const price = course.price;

                const approval = await approveTransaction(price);
                if (!approval?.status) {
                    openNotify({ message: 'Approve failed', type: 'error' });
                    return;
                }

                await marketPlaceContract.methods.buyCourse(course.index).send({ from: kit.defaultAccount });

                await onGetAllCourses();
                openNotify({ message: `Successfully bought course: ${course.title}`, type: 'success' });
            } catch (error) {
                openNotify({ message: getErrorMessage(error), type: 'error' });
            } finally {
                setLoading(false);
            }
        },
        [approveTransaction, kit.defaultAccount, marketPlaceContract, onGetAllCourses, openNotify],
    );

    const handleCompleteCourse = useCallback(
        async (course: Course) => {
            if (!marketPlaceContract || !kit.defaultAccount) {
                return;
            }

            try {
                setLoading(true);

                await marketPlaceContract.methods.completeCourse(course.index).send({ from: kit.defaultAccount });
                openNotify({ message: `Successfully completed course: ${course.title}`, type: 'success' });
            } catch (error) {
                openNotify({ message: getErrorMessage(error), type: 'error' });
            } finally {
                setLoading(false);
            }
        },
        [kit.defaultAccount, marketPlaceContract, openNotify],
    );

    useEffect(() => {
        checkCourseIsBought();
        checkCourseIsCompleted();
    }, [checkCourseIsBought, checkCourseIsCompleted]);

    const courseState = useMemo(
        () =>
            isBought
                ? isCompleted
                    ? {
                          status: CourseStatus.COMPLETED,
                          text: 'Completed',
                      }
                    : {
                          status: CourseStatus.BOUGHT,
                          text: 'Complete Course',
                      }
                : {
                      status: CourseStatus.NEW,
                      text: 'Buy Course',
                  },
        [isBought, isCompleted],
    );

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardMedia component="img" sx={{ height: '190px' }} src={course.image} alt={course.title} />
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="h2">
                    {course.title}
                </Typography>
                <Typography gutterBottom>{course.description}</Typography>
                <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                    {course.author}
                </Typography>
                <Stack direction="row" gap={1}>
                    <Typography sx={{ fontWeight: 600 }}>{`${course.price} CUSD`}</Typography>
                    <Typography sx={{ fontStyle: 'italic' }}>{`(${course.sold} bought)`}</Typography>
                </Stack>
            </CardContent>
            <CardActions>
                <LoadingButton
                    disabled={courseState.status === CourseStatus.COMPLETED}
                    loading={loading}
                    fullWidth
                    onClick={() => (isBought ? handleCompleteCourse(course) : handleBuyCourse(course))}
                    type="button"
                    size="small"
                    sx={{ mt: 2 }}>
                    {courseState.text}
                </LoadingButton>
            </CardActions>
        </Card>
    );
});

CourseItem.displayName = 'CourseItem';

export default CourseItem;
