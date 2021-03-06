/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import "./App.scss";

import { BrowserAuthorizationClient } from "@itwin/browser-authorization";
import type { ScreenViewport } from "@itwin/core-frontend";
import { FitViewTool, IModelApp, StandardViewId } from "@itwin/core-frontend";
import { FillCentered } from "@itwin/core-react";
import { ProgressLinear } from "@itwin/itwinui-react";
import { useAccessToken, Viewer } from "@itwin/web-viewer-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { history } from "./history";

import {highwaysDecorator} from "./decorators";

const App: React.FC = () => {
  const [iModelId, setIModelId] = useState("7412a95b-e63a-4791-af10-4e5e84ef6493");
  const [iTwinId, setITwinId] = useState("15bbbf95-06d8-46c5-af72-6b5a590071dc");

  const accessToken = useAccessToken();

  const authClient = useMemo(
    () =>
      new BrowserAuthorizationClient({
        //moved out of the env file
        scope: "itwinjs imodelaccess:read imodels:read realitydata:read",
        clientId: "spa-jKSUl0PJUnxhjqSPa5uKMlymj",
        redirectUri: `${window.location.origin}/auth`,
        postSignoutRedirectUri: `${window.location.origin}/auth`,
        responseType: "code",
        authority: "https://ims.bentley.com",
      }),
    []
  );

  const login = useCallback(async () => {
    try {
      await authClient.signInSilent();
    } catch {
      await authClient.signIn();
    }
  }, [authClient]);

  useEffect(() => {
    void login();
  }, [login]);

  useEffect(() => {
    if (accessToken) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has("iTwinId")) {
        setITwinId(urlParams.get("iTwinId") as string);
      } else {
        if (!iTwinId) {
          throw new Error(
            "Please add a valid iTwin ID in the .env file and restart the application or add it to the iTwinId query parameter in the url and refresh the page. See the README for more information."
          );
        }
      }

      if (urlParams.has("iModelId")) {
        setIModelId(urlParams.get("iModelId") as string);
      } else {
        if (!iModelId) {
          throw new Error(
            "Please add a valid iModel ID in the .env file and restart the application or add it to the iModelId query parameter in the url and refresh the page. See the README for more information."
          );
        }
      }
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken && iTwinId && iModelId) {
      history.push(`?iTwinId=${iTwinId}&iModelId=${iModelId}`);
    }
  }, [accessToken, iTwinId, iModelId]);

  
  const viewConfiguration = useCallback((viewPort: ScreenViewport) => {
    const tileTreesLoaded = () => {
      return new Promise((resolve, reject) => {
        const start = new Date();
        const intvl = setInterval(() => {
          if (viewPort.areAllTileTreesLoaded) {
            clearInterval(intvl);
            resolve(true);
          }
          const now = new Date();
          // after 20 seconds, stop waiting and fit the view
          if (now.getTime() - start.getTime() > 20000) {
            reject();
          }
        }, 100);
      });
    };

    tileTreesLoaded().finally(() => {
      IModelApp.viewManager.addDecorator(new highwaysDecorator(viewPort));
    });
  }, []);

  const viewCreatorOptions = useMemo(
    () => ({ viewportConfigurer: viewConfiguration }),
    [viewConfiguration]
  );

  return (
    <div className="viewer-container">
      {!accessToken && (
        <FillCentered>
          <div className="signin-content">
            <ProgressLinear indeterminate={true} labels={["Signing in..."]} />
          </div>
        </FillCentered>
      )}
      <Viewer
        iTwinId={iTwinId}
        iModelId={iModelId}
        authClient={authClient}
        viewCreatorOptions={viewCreatorOptions}
        enablePerformanceMonitors={true} // see description in the README (https://www.npmjs.com/package/@itwin/desktop-viewer-react)
      />
    </div>
  );
};

export default App;
