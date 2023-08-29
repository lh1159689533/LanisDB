import { Switch, Route, BrowserRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { ConfirmProvider } from 'material-ui-confirm';
import { routes } from './router';
import 'monaco-editor/esm/vs/editor/editor.all';
import 'monaco-editor/esm/vs/basic-languages/mysql/mysql.contribution';
import 'monaco-editor/esm/vs/basic-languages/pgsql/pgsql.contribution';
import 'monaco-editor/esm/vs/basic-languages/sql/sql.contribution';

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
