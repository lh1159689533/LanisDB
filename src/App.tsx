import { Switch, Route, BrowserRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { ConfirmProvider } from 'material-ui-confirm';
import { routes } from './router';

function App() {
  return (
    <SnackbarProvider>
      <ConfirmProvider>
        <BrowserRouter>
          <Switch>
            {routes?.map((route) => {
              const { path, component: Component } = route as any;
              return <Route key={path} path={path} render={(props) => <Component {...props} />} />;
            })}
          </Switch>
        </BrowserRouter>
      </ConfirmProvider>
    </SnackbarProvider>
  );
}

export default App;
