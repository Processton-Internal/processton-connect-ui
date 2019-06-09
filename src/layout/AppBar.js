import React, {useState} from 'react';
import {
    AppBar,
    Avatar,
    CircularProgress, Hidden,
    IconButton, makeStyles,
    Menu,
    MenuItem,
    Toolbar,
    Typography
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import AuthorizationService from "../services/AuthorizationService";
import RecordSelector from "../components/RecordSelector";
import SearchIcon from '@material-ui/icons/Search';
import HomeIcon from '@material-ui/icons/Home';
import {fade} from '@material-ui/core/styles/colorManipulator';
import TenantSelector from "../components/TenantSelector";

const useStyles = makeStyles(theme => ({
    grow: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        display: 'none',
        [theme.breakpoints.up('sm')]: {
            display: 'block',
        },
    },
    search: {
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: fade(theme.palette.common.white, 0.25),
        },
        marginRight: theme.spacing(2),
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing(3),
            width: 'auto',
        },
    },
    searchIcon: {
        width: theme.spacing(7),
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputRoot: {
        color: 'inherit',
    },
    inputInput: {
        padding: theme.spacing(1, 1, 1, 7),
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: 200,
        },
    },
    sectionDesktop: {
        display: 'none',
        [theme.breakpoints.up('md')]: {
            display: 'flex',
        },
    },
    sectionMobile: {
        display: 'flex',
        [theme.breakpoints.up('md')]: {
            display: 'none',
        },
    },
}));

const DataTypeSelector = { namespace: 'Setup', name: 'DataType' };

const AdminAppBar = ({ onToggle }) => {

    const [idToken, seIdToken] = useState(null),
        [menuAnchor, setMenuAnchor] = useState(null),

        classes = useStyles(),
        inputClasses = {
            root: classes.inputRoot,
            input: classes.inputInput,
        };

    function handleClick(e) {
        setMenuAnchor(e.currentTarget);
    }

    function handleClose() {
        setMenuAnchor(null);
    }

    function handleLogout() {
        handleClose();
        AuthorizationService.logout();
    }

    if (!idToken) {
        AuthorizationService.getIdToken().then(token => seIdToken(token));
        return <CircularProgress/>
    }

    return <div style={{ flexGrow: 1 }}>
        <AppBar position="static">
            <Toolbar>
                <IconButton edge="start" color="inherit" aria-label="Menu" onClick={onToggle}>
                    <MenuIcon/>
                </IconButton>
                <Hidden xsDown>
                    <Typography variant="h6">
                        Admin
                    </Typography>
                </Hidden>
                <div className={classes.search}>
                    <div className={classes.searchIcon}>
                        <SearchIcon/>
                    </div>
                    <RecordSelector dataTypeSelector={DataTypeSelector} inputClasses={inputClasses}/>
                </div>
                <div className={classes.grow}/>
                <div className={classes.search}>
                    <div className={classes.searchIcon}>
                        <HomeIcon/>
                    </div>
                    <TenantSelector inputClasses={inputClasses}/>
                </div>
                <Hidden xsDown>
                    <IconButton onClick={handleClick}>
                        <Avatar alt={idToken.name} src={idToken.picture}/>
                    </IconButton>
                    <Menu anchorEl={menuAnchor}
                          anchorOrigin={{
                              vertical: "bottom",
                              horizontal: "right"
                          }}
                          getContentAnchorEl={null}
                          keepMounted
                          open={Boolean(menuAnchor)}
                          onClose={handleClose}>
                        <MenuItem onClick={handleLogout}>Sign out</MenuItem>
                    </Menu>
                </Hidden>
            </Toolbar>
        </AppBar>
    </div>
};

export default AdminAppBar;