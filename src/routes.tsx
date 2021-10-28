import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Account } from "./pages/Account";
import { Chat } from "./pages/Chat";

export const Routes = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" exact>
          <Account />
        </Route>
        <Route path="/chat">
          <Chat />
        </Route>
      </Switch>
    </Router>
  );
};
