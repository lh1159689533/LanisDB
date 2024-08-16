import { Switch, Route, BrowserRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { ConfirmProvider } from 'material-ui-confirm';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { routes } from './router';

const theme = createTheme({
  palette: {
    primary: {
      main: 'rgb(0, 150, 136)',
      light: 'rgb(0, 150, 136)',
      dark: 'rgb(0, 150, 136)',
      contrastText: '#fff',
    },
    secondary: {
      main: 'rgba(0, 150, 136, 0.8)',
      light: 'rgba(0, 150, 136, 0.8)',
      dark: 'rgba(0, 150, 136, 0.8)',
      contrastText: '#fff',
    },
    error: {
      main: 'rgb(204, 56, 66)',
      light: 'rgb(204, 56, 66)',
      dark: 'rgb(230, 89, 76)',
      contrastText: '#fff',
    },
  },
  typography: {
    fontFamily: 'PingFang SC, Microsoft YaHei, Hack',
    fontSize: 13,
  },
});

function App() {
  return (
    <SnackbarProvider>
      <ConfirmProvider>
        <ThemeProvider theme={theme}>
          <BrowserRouter>
            <Switch>
              {routes?.map((route) => {
                const { path, component: Component } = route as any;
                return <Route key={path} path={path} render={(props) => <Component {...props} />} />;
              })}
            </Switch>
          </BrowserRouter>
        </ThemeProvider>
      </ConfirmProvider>
    </SnackbarProvider>
  );
}

export default App;
