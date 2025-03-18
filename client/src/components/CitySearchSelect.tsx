import {
    Autocomplete,
    TextField,
    CircularProgress,
    Typography,
    Box
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

interface CityOption {
    place: string;
    postal_code: string;
}

interface CitySearchSelectProps<T> {
    model: T;
    onModelChange: (updatedModel: T) => void;
    label?: string;
    placeholder?: string;
    fieldName?: keyof T;
    postalCodeFieldName?: keyof T;
    error?: string;
    disabled?: boolean;
}

const CitySearchSelect = <T,>({
    model,
    onModelChange,
    label = "Miasto",
    placeholder = "Wpisz minimum 3 znaki",
    fieldName = 'city' as keyof T,
    postalCodeFieldName = 'postal_code' as keyof T,
    error,
    disabled = false
}: CitySearchSelectProps<T>) => {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<CityOption[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedOption, setSelectedOption] = useState<CityOption | null>(null);

    const formatPostalCode = (value: string): string => {
        if (/^\d+/.test(value)) {
            const digitsOnly = value.replace(/-/g, '');

            if (digitsOnly.length >= 2) {
                return `${digitsOnly.substring(0, 2)}-${digitsOnly.substring(2)}`;
            }
        }
        return value;
    };

    useEffect(() => {
        let isActive = true;
        const timeoutId = setTimeout(() => {
            if (searchTerm.length >= 3) {
                setLoading(true);
                fetch(`/api/city/${searchTerm}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (isActive) {
                            setOptions(data);
                            setLoading(false);
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching city data:', error);
                        if (isActive) {
                            setOptions([]);
                            setLoading(false);
                        }
                    });
            } else {
                setOptions([]);
            }
        }, 1000);

        return () => {
            isActive = false;
            clearTimeout(timeoutId);
        };
    }, [searchTerm]);

    useEffect(() => {
        if (inputValue.length >= 3) {
            setSearchTerm(inputValue);
        } else {
            setOptions([]);
        }
    }, [inputValue]);

    const handleChange = useCallback((event: React.SyntheticEvent, newValue: CityOption | null) => {
        setSelectedOption(newValue);

        const updatedModel = { ...model };

        if (fieldName) {
            updatedModel[fieldName] = newValue?.place as T[keyof T];
        }

        if (postalCodeFieldName && newValue) {
            updatedModel[postalCodeFieldName] = newValue.postal_code as T[keyof T];
        }

        onModelChange(updatedModel);
    }, [model, onModelChange, fieldName, postalCodeFieldName]);

    return (
        <Autocomplete
            id="city-search-select"
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            filterOptions={(x) => x}
            options={options}
            loading={loading}
            disabled={disabled}
            value={selectedOption}
            onChange={handleChange}
            onInputChange={(event, newInputValue) => {
                const formattedValue = formatPostalCode(newInputValue);
                setInputValue(formattedValue);
            }}
            getOptionLabel={(option) => `${option.place} (${option.postal_code})`}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    placeholder={placeholder}
                    error={!!error}
                    helperText={error}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </>
                        ),
                    }}
                />
            )}
            renderOption={(props, option) => {
                const {key, ...rest} = props;
                return <Box component="li" key={key} {...rest}>
                    <Typography variant="body1">{option.place}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        {option.postal_code}
                    </Typography>
                </Box>
            }}
            noOptionsText="Nie znaleziono pasujących miast"
        />
    );
};

export default CitySearchSelect;