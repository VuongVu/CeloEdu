import { useCallback, useEffect, useRef, useState } from 'react';
import Head from 'next/head';

import { useContractKit } from '@celo-tools/use-contractkit';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LoadingButton from '@mui/lab/LoadingButton';

import Layout from 'components/ui/layout';
import CourseItem from 'components/ui/course/courseItem';
import AddCourse from 'components/ui/course/addCourse';

import { APP_ROUTERS } from 'constants/routers';
import type { CeloEduMarketplace } from 'abis/types';
import { CELO_EDU_MARKETPLACE_CONTRACT_ADDRESS } from 'constants/contracts';
import CELO_EDU_MARKETPLACE_ABI from 'abis/celo-edu-marketplace.json';
import type { Course } from 'components/ui/course/types';

import { useNotify } from 'components/base/notify/hooks';
import useContract from 'hooks/useContract';
import getErrorMessage from 'utils/getErrorMessage';

const Courses: NextPageProps = () => {
    const { openNotify } = useNotify();

    const { connect, account } = useContractKit();

    const marketPlaceContract = useContract<CeloEduMarketplace>(
        CELO_EDU_MARKETPLACE_ABI,
        CELO_EDU_MARKETPLACE_CONTRACT_ADDRESS,
    );

    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [isOpenAddCourse, setIsOpenAddCourse] = useState<boolean>(false);
    const isGetCourses = useRef<boolean>(false);

    const handleGetAllCourses = useCallback(async () => {
        if (!marketPlaceContract) return;

        try {
            setLoading(true);

            const totalCourses = await marketPlaceContract.methods.totalCourses().call();
            const coursesPromises = [];

            for (let i = 0; i < +totalCourses; i++) {
                const course = new Promise<Course>(async resolve => {
                    const p = await marketPlaceContract.methods.getCourse(i).call();
                    const result: Course = {
                        index: i,
                        title: p[1],
                        description: p[2],
                        author: p[3],
                        image: p[4],
                        price: +p[5],
                        sold: +p[6],
                    };

                    resolve(result);
                });
                coursesPromises.push(course);
            }

            const result = await Promise.all(coursesPromises);
            setCourses(result);
            isGetCourses.current = true;
        } catch (error) {
            openNotify({ message: getErrorMessage(error), type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [marketPlaceContract, openNotify]);

    const handleConnectWallet = useCallback(async () => {
        try {
            setLoading(true);

            await connect();
        } catch (error) {
            openNotify({ message: getErrorMessage(error), type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [connect, openNotify]);

    useEffect(() => {
        if (!isGetCourses.current) {
            handleGetAllCourses();
        }
    }, [handleGetAllCourses]);

    return (
        <>
            <Head>
                <title>{APP_ROUTERS.COURSES.title}</title>
            </Head>

            {account ? (
                <Box component="div">
                    <LoadingButton
                        onClick={handleGetAllCourses}
                        loading={loading}
                        type="button"
                        variant="outlined"
                        size="large"
                        sx={{ mt: 2 }}>
                        Get courses
                    </LoadingButton>
                    <LoadingButton
                        onClick={() => setIsOpenAddCourse(true)}
                        loading={loading}
                        type="button"
                        variant="outlined"
                        size="large"
                        color="success"
                        sx={{ mt: 2, ml: 2 }}>
                        Add course
                    </LoadingButton>
                    <Grid container spacing={4} mt={2}>
                        {courses.map(course => (
                            <Grid key={course.index} item xs={3} md={4}>
                                <CourseItem course={course} onGetAllCourses={handleGetAllCourses} />
                            </Grid>
                        ))}
                    </Grid>

                    <AddCourse
                        open={isOpenAddCourse}
                        onClose={() => setIsOpenAddCourse(false)}
                        onGetAllCourses={handleGetAllCourses}
                    />
                </Box>
            ) : (
                <LoadingButton
                    onClick={handleConnectWallet}
                    loading={loading}
                    type="button"
                    variant="outlined"
                    size="large"
                    color="info"
                    sx={{
                        mt: 2,
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%,-50%)',
                    }}>
                    Connect wallet
                </LoadingButton>
            )}
        </>
    );
};

Courses.Layout = Layout;

export default Courses;
