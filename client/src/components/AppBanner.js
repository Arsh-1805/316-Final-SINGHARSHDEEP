import { useContext, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom'
import AuthContext from '../auth';
import { GlobalStoreContext } from '../store'

import EditToolbar from './EditToolbar'

import AccountCircle from '@mui/icons-material/AccountCircle';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';

export default function AppBanner() {
    const { auth } = useContext(AuthContext);
    const { store } = useContext(GlobalStoreContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const isMenuOpen = Boolean(anchorEl);
    const history = useHistory();
    const location = useLocation();
    const guestRoutes = ["/home", "/playlists", "/playlist", "/songs"];
    const isGuestRoute = guestRoutes.some(path => location.pathname.startsWith(path));
    const showLibraryLinks = auth.loggedIn || (auth.isGuest && isGuestRoute);

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleMenuClose();
        auth.logoutUser();
    }

    const handleHouseClick = () => {
        store.closeCurrentList();
    }

    const menuId = 'primary-search-account-menu';
    const loggedOutMenu = (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            id={menuId}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={isMenuOpen}
            onClose={handleMenuClose}
        >
            <MenuItem onClick={handleMenuClose}><Link to='/login/'>Login</Link></MenuItem>
            <MenuItem onClick={handleMenuClose}><Link to='/register/'>Create New Account</Link></MenuItem>
        </Menu>
    );

const loggedInMenu = (
  <Menu
    anchorEl={anchorEl}
    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    id={menuId}
    keepMounted
    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    open={isMenuOpen}
    onClose={handleMenuClose}
  >
    <MenuItem
      onClick={() => {
        handleMenuClose();
        history.push("/account/");
      }}
    >
      Edit Account
    </MenuItem>
    <MenuItem onClick={handleLogout}>Logout</MenuItem>
  </Menu>
);

    let editToolbar = "";
    let menu = loggedOutMenu;
    if (auth.loggedIn) {
        menu = loggedInMenu;
        if (store.currentList) {
            editToolbar = <EditToolbar />;
        }
    }
    
function getAccountMenu(loggedIn) {
    if (loggedIn && auth.user) {
        if (auth.user.avatar && auth.user.avatar.length > 0) {
            return (
                <Avatar
                    src={auth.user.avatar}
                    alt={auth.user.userName || "User avatar"}
                    sx={{ width: 40, height: 40 }}
                />
            );
        }
        const initials = auth.getUserInitials();
        return (
            <Avatar sx={{ width: 40, height: 40 }}>
                {initials}
            </Avatar>
        );
    }
    return <AccountCircle />;
}

        return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar
                position="static"
                sx={{
                    backgroundColor: "#ff66ff",      
                    boxShadow: "none",               
                }}
            >
                <Toolbar sx={{ minHeight: 64 }}>
                    <Typography
                        variant="h4"
                        noWrap
                        component="div"
                        sx={{ display: { xs: "none", sm: "block" } }}
                    >
                        <Link
                            onClick={handleHouseClick}
                            style={{ textDecoration: "none", color: "white" }}
                            to="/"
                        >
                            ⌂
                        </Link>
                    </Typography>
                      <Box
                        sx={{
                            flexGrow: 1,
                            display: 'flex',
                            justifyContent: 'center',
                            gap: 2,
                            }}
                        >
                        {showLibraryLinks && (
                            <>
                                <Button color="inherit" onClick={() => history.push("/playlists")}>
                                    Playlists
                                </Button>
                                <Button color="inherit" onClick={() => history.push("/songs")}>
                                    Songs Catalog
                                </Button>
                            </>
                        )}
                        </Box>
                    <Box sx={{ flexGrow: 1 }}>{editToolbar}</Box>
                    <Box sx={{ height: "64px", display: { xs: "none", md: "flex" } }}>
                        <IconButton
                            size="large"
                            edge="end"
                            aria-label="account of current user"
                            aria-controls={menuId}
                            aria-haspopup="true"
                            onClick={handleProfileMenuOpen}
                            color="inherit"
                        >
                            {getAccountMenu(auth.loggedIn)}
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            <Box
                sx={{
                    width: "100%",
                    height: "1px",
                    backgroundColor: "#e0e0e0",
                }}
            />

            {menu}
        </Box>
    );
}
