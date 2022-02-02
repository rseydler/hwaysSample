/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/


import { QueryRowFormat } from "@itwin/core-common";
import {Decorator,  ScreenViewport, IModelConnection, DecorateContext, Marker } from "@itwin/core-frontend";
import {highwaysMarker} from "./markers"

export class highwaysDecorator implements Decorator{

    private _iModel: IModelConnection;
    private _markerSet: Marker[];

    constructor(vp:ScreenViewport){
        this._iModel = vp.iModel;
        this._markerSet = [];

        this.addMarkers();
    }

    //pull the camera element data from the imodel
    private async getCameras(){
        const query = "SELECT UserLabel, Origin from BisCore. PhysicalElement where userlabel like '%camera%' and Origin IS NOT NULL";

        const results = this._iModel.query(query, undefined, { rowFormat: QueryRowFormat.UseJsPropertyNames });
        const values = [];

        for await (const row of results){
            values.push(row);   
        }
        return values;
    }


    private async addMarkers(){
        const values = await this.getCameras();
        values.forEach(value => {
            const cameraMarker = new highwaysMarker(
                {x: value.origin.x, y: value.origin.y, z: value.origin.z},
                {x:50, y: 50},
                value.userLabel
            );

            this._markerSet.push(cameraMarker);
        }) 

    }

    public decorate(context: DecorateContext): void {
        this._markerSet.forEach(marker =>{
            marker.addDecoration(context);
        })
    }


}