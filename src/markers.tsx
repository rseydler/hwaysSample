import {BeButtonEvent, IModelApp, Marker, NotifyMessageDetails, OutputMessageAlert, OutputMessagePriority} from "@itwin/core-frontend";
import { XAndY, XYAndZ } from "@itwin/core-geometry";

export class highwaysMarker extends Marker{
    private _cameraId: string;

    constructor(location: XYAndZ, size: XAndY, cameraId:string){
        super(location, size);
        this._cameraId = cameraId;

        this.setImageUrl("/cam.png");
        // highways images
        const htmlElement = document.createElement("img");
        htmlElement.src='https://public.highwaystrafficcameras.co.uk/cctvpublicaccess/images/12011.jpg'; //need to use the camera id here but not present in the iModel :(
        this.title = htmlElement;
    }

    //when you click the marker it pops up the standard highways camera popup
    public onMouseButton(_ev: BeButtonEvent): boolean{
        if (!_ev.isDown) return true;
        //need to use the camera id here but not present :(
        window.open("https://public.highwaystrafficcameras.co.uk/cctvpublicaccess/html/12011.html","_campopup",`toolbar=no, 
        location=no,
        status=no,
        menubar=no,
        scrollbars=no,
        resizable=yes,
        width=370,
        height=450`);
        return true;
    }

}
