import React, { useEffect } from 'react';
import ActionRegistry, { CRUD } from "./ActionRegistry";
import DeleteIcon from '@material-ui/icons/Delete';
import WarningIcon from '@material-ui/icons/Info';
import CheckIcon from "@material-ui/icons/CheckCircle";
import CancelIcon from "@material-ui/icons/Cancel";
import clsx from "clsx";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { CircularProgress, makeStyles } from "@material-ui/core";
import ResponsiveContainer from "../components/ResponsiveContainer";
import { useContainerContext } from "./ContainerContext";
import { map } from "rxjs/operators";
import * as pluralize from "pluralize";
import Show from "./Show";
import zzip from "../util/zzip";
import { useSpreadState } from "../common/hooks";
import TextField from "@material-ui/core/TextField";

const useStyles = makeStyles(theme => ({
  okBox: {
    width: '100px',
    minHeight: '100px',
    borderRadius: '50%',
    position: 'relative',
    background: theme.palette.secondary.light,
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    justifyContent: 'center'
  },
  infoIcon: {
    position: 'absolute',
    top: '8px',
    right: 0,
    background: theme.palette.background.paper,
    borderRadius: '50%'
  },
  fullHeight: {
    height: '100%'
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  actionButton: {
    margin: theme.spacing(1)
  },
  okContainer: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: theme.palette.background.default
  },
  successLabel: {
    color: theme.palette.text.secondary
  },
  alignCenter: {
    textAlign: 'center'
  },
  loading: {
    color: theme.palette.secondary.main,
    position: 'absolute',
    top: -4,
    left: -4,
    zIndex: 1101,
  },
  confirmationInput: {
    margin: theme.spacing(1, 0),
    padding: theme.spacing(0, 1)
  }
}));

const Status = Object.freeze({
  loading: 1,
  ready: 2,
  destroying: 3,
  destroyed: 4,
  failed: 5
});

const CONFIRMATION_PHRASE = 'permanently delete';

const Delete = ({ dataType, onCancel, onClose }) => {
  const [state, setState] = useSpreadState({
    status: Status.loading,
    title: null,
  });

  const classes = useStyles();

  const [containerState, setContainerState] = useContainerContext();

  const { selectedItems, landingActionKey, selector } = containerState;

  const { status, title, config, confirmed } = state;

  useEffect(() => {
    setContainerState({ breadcrumbActionName: "Delete" });

    return () => {
      setContainerState({ breadcrumbActionName: null });
    };
  }, []);

  useEffect(() => {
    let theTitle;
    if (selectedItems.length === 1) {
      theTitle = dataType.titleFor(selectedItems[0]).pipe(
        map(title => `${title} will be destroyed!`)
      );
    } else {
      theTitle = dataType.getTitle().pipe(
        map(dtTitle => {
          dtTitle = pluralize(dtTitle);
          if (selectedItems.length > 1) {
            return `${selectedItems.length} ${dtTitle} will be destroyed!`;
          }
          return `All the found ${dtTitle} will be destroyed`;
        })
      );
    }
    const subscription = zzip(dataType.config(), theTitle).subscribe(
      ([config, title]) => {
        setState({
          status: Status.ready,
          title,
          config,
          confirmed: !config.actions?.delete?.confirmation
        });
      }
    );
    return () => subscription.unsubscribe();
  }, [dataType, selectedItems]);

  useEffect(() => {
    switch (status) {
      case Status.destroying: {
        const selection = selectedItems.length
          ? { _id: { $in: selectedItems.map(({ id }) => id) } }
          : selector || {};
        const subscription = dataType.bulkDelete(selection).subscribe(
          () => setState({ status: Status.destroyed }),
          () => setState({ status: Status.failed })
        );
        return () => subscription.unsubscribe();
      }
      case Status.destroyed:
        setTimeout(() => {
          if (landingActionKey === Show.key) {
            onClose();
          } else {
            setContainerState({ actionKey: landingActionKey })
          }
        }, 1000);
    }
  }, [status, selector]);

  const handleDestroy = () => setState({ status: Status.destroying });

  let statusUI, actions, text;
  switch (status) {
    case Status.ready:
      statusUI = <WarningIcon className={classes.infoIcon} color="secondary" component="svg" />;
      text = title;
      const confirmation = config.actions?.delete?.confirmation && (
        <>
          <Typography component="div"
                      variant="subtitle1"
                      className={clsx(classes.successLabel, classes.alignCenter)}>
            This is a high risk operation and the associated data may be lost forever.
          </Typography>
          <Typography component="div"
                      variant="subtitle2"
                      className={clsx(classes.successLabel, classes.alignCenter)}>
            To confirm deletion, type <em>{CONFIRMATION_PHRASE}</em> in the text input below.
          </Typography>
          <TextField variant="outlined"
                     className={classes.confirmationInput}
                     placeholder={CONFIRMATION_PHRASE}
                     onChange={e => setState({ confirmed: e.target.value === CONFIRMATION_PHRASE })} />
        </>
      );
      actions = (
        <>
          {confirmation || (
            <Typography variant='subtitle1'
                        className={clsx(classes.successLabel, classes.alignCenter)}
                        component="div">
              Are you sure you want to proceed?
            </Typography>
          )}
          <div className={classes.alignCenter}>
            <Button variant="outlined"
                    color="secondary"
                    startIcon={<CancelIcon component="svg" />}
                    className={classes.actionButton}
                    onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="contained"
                    color="secondary"
                    startIcon={<CheckIcon component="svg" />}
                    className={classes.actionButton}
                    onClick={handleDestroy}
                    disabled={!confirmed}>
              {confirmation ? 'Delete' : "Yes, I'm sure!"}
            </Button>
          </div>
        </>
      );
      break;
    case Status.destroyed:
      statusUI = <CheckIcon className={classes.infoIcon} color="secondary" component="svg" />;
      text = `Done!`;
      break;
    case Status.failed:
      statusUI = <WarningIcon className={classes.infoIcon} color="secondary" component="svg" />;
      text = 'Operation failed';
      break;
    default:
      statusUI = <CircularProgress size={110} className={classes.loading} />;
      if (status === Status.destroying) {
        text = 'Destroying...';
      }
  }

  return <ResponsiveContainer>
    <div className={classes.okContainer}>
      <div className={clsx(classes.okBox, classes.center)}>
        {statusUI}
        <DeleteIcon fontSize='large' component="svg" />
      </div>
      <Typography variant='h5' className={classes.alignCenter} component="div">
        {text}
      </Typography>
      {actions}
    </div>
  </ResponsiveContainer>;
};

export default ActionRegistry.register(Delete, {
  icon: DeleteIcon,
  title: 'Delete',
  bulkable: true,
  bulkableExceptions: [
    { namespace: '', name: 'Account' },
    { namespace: '', name: 'User' }
  ],
  activeColor: 'secondary',
  crud: [CRUD.delete],
  group: 4,
  key: 'delete'
});
