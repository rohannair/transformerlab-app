/* eslint-disable jsx-a11y/anchor-is-valid */
import { useCallback, useEffect, useState } from 'react';

import {
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
  Select,
  Sheet,
  Table,
  Typography,
  Option,
  Chip,
  Link,
  Box,
  Stack,
  LinearProgress,
  Modal,
} from '@mui/joy';

import { Link as ReactRouterLink, useLocation } from 'react-router-dom';

import { ColorPaletteProp } from '@mui/joy/styles';

import {
  ArrowDownIcon,
  BoxesIcon,
  CheckIcon,
  CreativeCommonsIcon,
  FolderOpenIcon,
  GraduationCapIcon,
  InfoIcon,
  PlusIcon,
  SearchIcon,
  StoreIcon,
  Trash2Icon,
} from 'lucide-react';
import SelectButton from '../Experiment/SelectButton';
import CurrentFoundationInfo from '../Experiment/Foundation/CurrentFoundationInfo';
import useSWR from 'swr';
import * as chatAPI from '../../lib/transformerlab-api-sdk';
import Welcome from '../Welcome';

type Order = 'asc' | 'desc';

function convertModelObjectToArray(modelObject) {
  // The model object in the storage is big object,
  // Here we turn that into an array of objects

  const arr = [{}];
  const keys = Object.keys(modelObject);

  for (let i = 0, n = keys.length; i < n; i++) {
    const key = keys[i];
    arr[i] = modelObject[key];
    arr[i].name = key;
  }

  return arr;
}

function openModelFolderInFilesystem() {
  //window.filesys.openModelFolder();
}

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function LocalModels({
  pickAModelMode = false,
  experimentInfo,
  setFoundation = (name: string) => {},
  setAdaptor = (name: string) => {},
}) {
  const [order, setOrder] = useState<Order>('desc');
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [open, setOpen] = useState(false);

  const [localModels, setLocalModels] = useState([]);

  const { data, error, isLoading, mutate } = useSWR(
    chatAPI.Endpoints.Models.LocalList(),
    fetcher
  );

  const location = useLocation();

  const foundationSetter = useCallback(async (name) => {
    setOpen(true);

    setFoundation(name);
    const escapedModelName = name.replaceAll('.', '\\.');

    setAdaptor('');

    setOpen(false);
  }, []);

  const renderFilters = () => (
    <>
      <FormControl size="sm">
        <FormLabel>License</FormLabel>
        <Select
          placeholder="Filter by license"
          slotProps={{ button: { sx: { whiteSpace: 'nowrap' } } }}
        >
          <Option value="MIT">MIT</Option>
          <Option value="pending">CC BY-SA-4.0</Option>
          <Option value="refunded">Refunded</Option>
          <Option value="Cancelled">Apache 2.0</Option>
        </Select>
      </FormControl>
      <FormControl size="sm">
        <FormLabel>Category</FormLabel>
        <Select placeholder="All">
          <Option value="all">All</Option>
        </Select>
      </FormControl>
    </>
  );

  if (pickAModelMode && experimentInfo?.config?.foundation) {
    return (
      <CurrentFoundationInfo
        experimentInfo={experimentInfo}
        foundation={experimentInfo?.config?.adaptor}
        setFoundation={setFoundation}
        adaptor={experimentInfo?.config?.adaptor}
        setAdaptor={setAdaptor}
      />
    );
  }

  if (!experimentInfo && location?.pathname !== '/zoo') {
    return <Welcome />;
  }

  return (
    <>
      <Typography level="h1" mb={2}>
        Local Models
      </Typography>
      <Modal
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        open={open}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Sheet
          variant="outlined"
          sx={{
            maxWidth: 500,
            borderRadius: 'md',
            p: 3,
            boxShadow: 'lg',
          }}
        >
          <Typography
            component="h2"
            id="modal-title"
            level="h4"
            textColor="inherit"
            fontWeight="lg"
            mb={1}
          >
            Preparing Model
          </Typography>
          <Typography id="modal-desc" textColor="text.tertiary">
            <Stack spacing={2} sx={{ flex: 1 }}>
              Quantizing Parameters:
              <LinearProgress />
            </Stack>
          </Typography>
        </Sheet>
      </Modal>
      <Box
        className="SearchAndFilters-tabletUp"
        sx={{
          borderRadius: 'sm',
          py: 2,
          display: {
            xs: 'flex',
            sm: 'flex',
          },
          flexWrap: 'wrap',
          gap: 1.5,
          '& > *': {
            minWidth: {
              xs: '120px',
              md: '160px',
            },
          },
        }}
      >
        <FormControl sx={{ flex: 1 }} size="sm">
          <FormLabel>&nbsp;</FormLabel>
          <Input placeholder="Search" startDecorator={<SearchIcon />} />
        </FormControl>

        {renderFilters()}
      </Box>
      <Sheet
        className="OrderTableContainer"
        variant="outlined"
        sx={{
          width: '100%',
          borderRadius: 'md',
          flex: 1,
          overflow: 'auto',
          minHeight: 0,
        }}
      >
        <Table
          aria-labelledby="tableTitle"
          stickyHeader
          hoverRow
          sx={{
            '--TableCell-headBackground': (theme) =>
              theme.vars.palette.background.level1,
            '--Table-headerUnderlineThickness': '1px',
            '--TableRow-hoverBackground': (theme) =>
              theme.vars.palette.background.level1,
          }}
        >
          <thead>
            <tr>
              <th style={{ width: 140, padding: 12 }}>
                <Link
                  underline="none"
                  color="primary"
                  component="button"
                  onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
                  fontWeight="lg"
                  endDecorator={<ArrowDownIcon />}
                  sx={{
                    '& svg': {
                      transition: '0.2s',
                      transform:
                        order === 'desc' ? 'rotate(0deg)' : 'rotate(180deg)',
                    },
                  }}
                >
                  Name
                </Link>
              </th>
              <th style={{ width: 120, padding: 12 }}>Params</th>
              <th style={{ width: 120, padding: 12 }}>Released</th>
              {/* <th style={{ width: 220, padding: 12 }}>Type</th> */}
              <th style={{ width: 120, padding: 12 }}>&nbsp;</th>
              <th style={{ width: 160, padding: 12 }}> </th>
            </tr>
          </thead>
          <tbody>
            {data &&
              data.map((row) => (
                <tr key={row.rowid}>
                  <td>
                    <Typography ml={2} fontWeight="lg">
                      {row.name}
                    </Typography>
                  </td>
                  <td>{row?.json_data?.parameters}</td>
                  <td>
                    <Chip
                      variant="soft"
                      size="sm"
                      startDecorator={
                        {
                          MIT: <CheckIcon />,
                          Apache: <GraduationCapIcon />,
                          CC: <CreativeCommonsIcon />,
                        }[row.status]
                      }
                      color={
                        {
                          MIT: 'success',
                          Apache: 'neutral',
                          CC: 'success',
                        }[row.status] as ColorPaletteProp
                      }
                    >
                      {row?.json_data?.license}
                    </Chip>
                  </td>
                  {/* <td>
        <Box
          sx={{ display: "flex", gap: 2, alignItems: "center" }}
        ></Box>
      </td> */}
                  <td>{row.model_id}</td>
                  <td style={{ textAlign: 'right' }}>
                    {/* <Link fontWeight="lg" component="button" color="neutral">
        Archive
      </Link> */}
                    {pickAModelMode === true ? (
                      <SelectButton
                        setFoundation={foundationSetter}
                        name={row.name}
                        setAdaptor={setAdaptor}
                      />
                    ) : (
                      <>
                        <InfoIcon
                          onClick={() => {
                            alert(JSON.stringify(row?.json_data));
                          }}
                        />
                        &nbsp;
                        <Trash2Icon
                          color="red"
                          onClick={() => {
                            mutate();
                          }}
                        />
                      </>
                    )}
                  </td>
                </tr>
              ))}
            {data?.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <Typography
                    level="body-lg"
                    justifyContent="center"
                    margin={5}
                  >
                    You do not have any models on your local machine. You can
                    download a model by going to the{' '}
                    <ReactRouterLink to="/zoo">
                      <StoreIcon />
                      Model Store
                    </ReactRouterLink>
                    .
                  </Typography>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Sheet>
      <Box
        sx={{
          justifyContent: 'space-between',
          display: 'flex',
          width: '100%',
          paddingTop: '12px',
        }}
      >
        {pickAModelMode === true ? (
          ''
        ) : (
          <>
            <FormControl>
              <Input
                placeholder="decapoda-research/llama-30b-hf"
                endDecorator={
                  <Button
                    onClick={() => {
                      alert('Not yet implemented.');
                    }}
                  >
                    Download 🤗 Model
                  </Button>
                }
                sx={{ width: '500px' }}
              />
            </FormControl>
            <Button
              size="sm"
              sx={{ height: '30px' }}
              endDecorator={<PlusIcon />}
            >
              New
            </Button>
          </>
        )}
      </Box>
    </>
  );
}