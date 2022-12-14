import React, { useEffect } from 'react';
import ClearIcon from '@material-ui/icons/Clear';
import BlankIcon from '@material-ui/icons/IndeterminateCheckBox';
import TrueIcon from '@material-ui/icons/CheckBox';
import { FormControl, IconButton, FilledInput, InputAdornment, InputLabel } from "@material-ui/core";
import { useSpreadState } from "../common/hooks";
import { useFormContext } from "./FormContext";
import { useBooleanViewerStyles } from "../viewers/BooleanViewer";
import FalseIcon from "../icons/FalseIcon";

const BooleanControl = ({ title, onChange, value, onDelete, disabled, readOnly, deleteDisabled }) => {

  const [state, setState] = useSpreadState({ focused: false });

  const { initialFormValue } = useFormContext();

  const classes = useBooleanViewerStyles();

  useEffect(() => {
    setState({ booleanValue: value.get() });
    const subscription = value.changed().subscribe(
      booleanValue => setState({ booleanValue })
    );
    return () => subscription.unsubscribe();
  }, [value]);

  const { focused, booleanValue } = state;

  const CheckIcon = booleanValue === undefined || booleanValue === null
    ? BlankIcon
    : (booleanValue
        ? TrueIcon
        : FalseIcon
    );
  const displayValue = String(booleanValue);

  const handleChange = () => {
    const newBoolean = !booleanValue;
    setState({ focused: true, booleanValue: newBoolean });
    value.set(newBoolean);
    onChange(newBoolean);
  };

  const handleDelete = (
    !deleteDisabled && !disabled && !readOnly && booleanValue !== undefined && booleanValue !== null
  ) && (() => {
    const initialValue = value.valueFrom(initialFormValue);
    setState({ focused: true, booleanValue: initialValue ? null : undefined });
    if (initialValue !== null && initialValue !== undefined) {
      value.set(null);
    } else {
      value.delete();
    }
    onDelete();
  });

  return (
    <FormControl variant="filled" fullWidth={true} disabled={disabled}>
      <InputLabel>{title}</InputLabel>
      <FilledInput key={displayValue}
                   readOnly
                   placeholder={displayValue}
                   autoFocus={focused}
                   endAdornment={
                     <InputAdornment position="end">

                       <IconButton onClick={handleChange} disabled={disabled || readOnly}>
                         <CheckIcon color={focused ? 'primary' : 'inherit'}
                                    className={classes[String(booleanValue)]} />
                       </IconButton>
                       {handleDelete && (
                         <IconButton onClick={handleDelete}>
                           <ClearIcon />
                         </IconButton>
                       )}
                     </InputAdornment>
                   }
                   onFocus={() => setState({ focused: true })}
                   onBlur={() => setState({ focused: false })}
      />
    </FormControl>
  );
};

export default BooleanControl;
