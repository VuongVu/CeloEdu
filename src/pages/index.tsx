import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';

import BN from 'bn.js';
import { ContractKit } from '@celo/contractkit';
import { useContractKit } from '@celo-tools/use-contractkit';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import TextField from '@mui/material/TextField';
import Modal from '@mui/material/Modal';
import LinearProgress from '@mui/material/LinearProgress';
import { DataGrid, type GridColDef, type GridRowsProp } from '@mui/x-data-grid';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import ShoppingCartCheckoutOutlinedIcon from '@mui/icons-material/ShoppingCartCheckoutOutlined';

import Layout from 'components/ui/layout';
import TableNoData from 'components/ui/table-no-data';

import { ROUTERS_UN_AUTH } from 'routers';
import { MARKET_PLACE_CONTRACT_ADDRESS, CUSD_CONTRACT_ADDRESS } from 'constants/contracts';
import { type Marketplace } from 'abis/types/Marketplace';
import MARKET_PLACE_ABI from 'abis/marketplace.json';
import { type Erc20 } from 'abis/types/Erc20';
import ERC20_ABI from 'abis/erc20.json';

import useContract from 'hooks/useContract';
import { useNotify } from 'components/base/notify/hooks';

interface Product {
    index: number;
    owner: string;
    name: string;
    image: string;
    description: string;
    location: string;
    price: number;
    sold: string;
}

type ProductFormData = Omit<Product, 'index' | 'owner' | 'sold'>;

const addProductSchema = yup
    .object({
        name: yup.string().required(),
        image: yup.string(),
        description: yup.string(),
        location: yup.string(),
        price: yup.number().positive().required(),
    })
    .required();

const HomePage: NextPageProps = () => {
    const { openNotify } = useNotify();

    const marketPlaceContract = useContract<Marketplace>(MARKET_PLACE_ABI, MARKET_PLACE_CONTRACT_ADDRESS);
    const cUSDContract = useContract<Erc20>(ERC20_ABI, CUSD_CONTRACT_ADDRESS);
    const { getConnectedKit } = useContractKit();
    const kit = useRef<ContractKit | null>(null);

    const { register, handleSubmit, reset } = useForm<ProductFormData>({
        resolver: yupResolver(addProductSchema),
    });

    const getProducts = useCallback(async () => {
        if (!marketPlaceContract) {
            openNotify({ message: 'Marketplace Contract was not found', type: 'error' });
            return;
        }

        try {
            const productLength = await marketPlaceContract.methods.getProductsLength().call();
            const productPromises = [];

            for (let i = 0; i < +productLength; i++) {
                const product = new Promise<Product>(async resolve => {
                    const p = await marketPlaceContract.methods.readProduct(i).call();
                    const result: Product = {
                        index: i,
                        owner: p[0],
                        name: p[1],
                        image: p[2],
                        description: p[3],
                        location: p[4],
                        price: new BN(p[5]).toNumber(),
                        sold: p[6],
                    };

                    resolve(result);
                });

                productPromises.push(product);
            }

            const result = await Promise.all(productPromises);
            setTableRows(result);
        } catch (error: any) {
            openNotify({ message: error.message, type: 'error' });
        }
    }, [marketPlaceContract, openNotify]);

    const approveTransaction = useCallback(
        async (price: number) => {
            if (!cUSDContract) {
                openNotify({ message: 'cUSDT Contract was not found', type: 'error' });
                return;
            }

            const approval = await cUSDContract.methods
                .approve(MARKET_PLACE_CONTRACT_ADDRESS, price)
                .send({ from: kit.current?.defaultAccount });

            return approval;
        },
        [cUSDContract, openNotify],
    );

    const handleBuyProduct = useCallback(
        async (product: Product) => {
            try {
                if (!marketPlaceContract) {
                    openNotify({ message: 'Marketplace Contract was not found', type: 'error' });
                    return;
                }

                setLoading(true);

                await approveTransaction(product.price);
                await marketPlaceContract.methods.buyProduct(product.index).send({ from: kit.current?.defaultAccount });

                openNotify({ message: `Product ${product.name} successfully bought`, type: 'success' });
                getProducts();
            } catch (error: any) {
                openNotify({ message: error.message, type: 'error' });
            } finally {
                setLoading(false);
            }
        },
        [approveTransaction, getProducts, marketPlaceContract, openNotify],
    );

    const tableColumns = useMemo<GridColDef[]>(
        () => [
            {
                field: 'index',
                headerName: 'Index',
                flex: 0.5,
                minWidth: 50,
            },
            {
                field: 'owner',
                headerName: 'Owner',
                flex: 1,
                minWidth: 100,
            },
            {
                field: 'name',
                headerName: 'Name',
                flex: 1,
                minWidth: 100,
            },
            {
                field: 'image',
                headerName: 'Image',
            },
            {
                field: 'description',
                headerName: 'Description',
            },
            {
                field: 'location',
                headerName: 'Location',
            },
            {
                field: 'price',
                headerName: 'Price',
                width: 150,
            },
            {
                field: 'sold',
                headerName: 'Sold',
                width: 150,
            },
            {
                field: 'actions',
                headerName: 'Actions',
                width: 150,
                renderCell: params => {
                    return (
                        <IconButton onClick={() => handleBuyProduct(params.row)} color="inherit">
                            {<ShoppingCartCheckoutOutlinedIcon />}
                        </IconButton>
                    );
                },
            },
        ],
        [handleBuyProduct],
    );
    const [tableRows, setTableRows] = useState<GridRowsProp>([]);
    const [openAddProductModal, setOpenAddProductModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleOpenAddProductModal = useCallback(() => {
        setOpenAddProductModal(true);
    }, []);

    const handleCloseAddProductModal = useCallback(() => {
        setOpenAddProductModal(false);
    }, []);

    const handleFormSubmit: SubmitHandler<ProductFormData> = async data => {
        try {
            if (!marketPlaceContract) {
                openNotify({ message: 'Marketplace Contract was not found', type: 'error' });
                return;
            }

            const { name, image, description, location, price } = data;

            setLoading(true);
            await marketPlaceContract.methods
                .writeProduct(name, image, description, location, new BN(price))
                .send({ from: kit.current?.defaultAccount });

            openNotify({ message: `Product ${name} successfully added`, type: 'success' });
            handleCloseAddProductModal();
            reset();
            getProducts();
        } catch (error: any) {
            openNotify({ message: error.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        async function getContractKit() {
            if (!kit.current) {
                kit.current = await getConnectedKit();
            }
        }

        getContractKit();
    }, [getConnectedKit]);

    return (
        <>
            <Head>
                <title>{ROUTERS_UN_AUTH.HOME.title}</title>
            </Head>

            <Box component="div">
                <Stack direction="row" alignItems="center" spacing={2} sx={{ marginBottom: 5 }}>
                    <Button variant="outlined" onClick={getProducts}>
                        Get products
                    </Button>
                    <Button variant="outlined" color="success" onClick={handleOpenAddProductModal}>
                        Add product
                    </Button>
                </Stack>

                <Box component="div" sx={{ height: 500, width: '100%' }}>
                    <DataGrid
                        disableSelectionOnClick
                        columns={tableColumns}
                        rows={tableRows}
                        getRowId={(row: Product) => row.index}
                        components={{
                            NoRowsOverlay: TableNoData,
                            LoadingOverlay: LinearProgress,
                        }}
                        loading={loading}
                    />
                </Box>

                <Modal open={openAddProductModal} onClose={handleCloseAddProductModal}>
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
                        <Grid container spacing={2}>
                            <Grid item sm={12}>
                                <TextField required fullWidth label="Product Name" {...register('name')} />
                            </Grid>
                            <Grid item sm={12}>
                                <TextField fullWidth label="Image url" {...register('image')} />
                            </Grid>
                            <Grid item sm={12}>
                                <TextField fullWidth label="Description" {...register('description')} />
                            </Grid>
                            <Grid item sm={12}>
                                <TextField fullWidth label="Location" {...register('location')} />
                            </Grid>
                            <Grid item sm={12}>
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
                            </Grid>
                        </Grid>
                        <LoadingButton
                            loading={loading}
                            loadingPosition="start"
                            startIcon={<AddOutlinedIcon />}
                            type="submit"
                            variant="outlined"
                            fullWidth
                            size="large"
                            sx={{ mt: 2 }}>
                            {loading ? 'Submitting' : 'Submit'}
                        </LoadingButton>
                    </Box>
                </Modal>
            </Box>
        </>
    );
};

HomePage.Layout = Layout;

export default HomePage;
