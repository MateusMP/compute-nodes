import { DataOrigin } from "../Constants";
import { DataProvider, DataDescriptor } from "./DataProvider";
import CanvasNode from "../nodes/CanvasNode";
import { ColumnMetadata } from "../data/api";

import { SampleNodes } from "../mock/data";

class BackendDataProvider implements DataProvider {
    fetchResources() {
        return ColumnMetadata.then(res => {
            return res.data;
        }).catch();
    }

    loadDashboard(dashboardId: string): Promise<any> {
        return Promise.resolve(SampleNodes);
    }

}

const dataProvider = new BackendDataProvider();

export default dataProvider;