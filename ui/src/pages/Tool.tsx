import React from 'react';
import {Content} from '@allenai/varnish/components';
import * as antd from 'antd';
const { Title, Paragraph, Text } = antd.Typography;

export default class Tool extends React.PureComponent {
    render() {
        return (
            <React.Fragment  >
                <Content main  className="center" style={{width: "90%"}}>
                <h3>Tool Functionality</h3>

<img src="images/corefi.png" className="center" width="90%" height="90%" margin-left="auto" margin-right="auto"/>
<br></br>
<br></br>

<Paragraph>
<p>The first mention is automatically assigned to the first cluster and appears in the “cluster bank” and the hierarchy. The current mention to assign is underlined in purple. Now, you have two possibilities: 
</p>
<ol>
    <li>This mention belongs to an existing cluster: select the corresponding cluster on the cluster bank, or in the hierarchy, or click on any of its mentions in the text, then press Space. </li>
    <li>This mention does not belong to any previous clusters: create a new cluster by pressing <Text keyboard>Alt</Text> + <Text keyboard>SPACE</Text> (MacOS) or <Text keyboard>Ctrl</Text> + <Text keyboard>SPACE</Text> (Windows) or clicking on the <Text keyboard>+</Text> in the cluster bank. Now that you have created a new cluster, annotate its relations in the hierarchy (if any).</li>
</ol>
After this assignment, the tool will show you automatically the next mention to assign until you have assigned all the candidate mentions. 
</Paragraph>


<Paragraph>
To see all the mentions in a cluster, you can:
<ul>
    <li>Click on the cluster in the cluster bank</li>
    <li>Click on the cluster in the hierarchy</li>
    <li>Click on any of its mentions in the text</li>
</ul>
</Paragraph>

<Paragraph>
To re-assign a previously assigned mention to another cluster, select the mention using:
<ul>
    <li><Text keyboard>option</Text> + Click (MacOS)</li>
    <li><Text keyboard>Ctrl</Text> + Click (Windows)</li>
    <li>Double Click (ALL) on the mention.</li>
</ul>
</Paragraph>


<Paragraph>
    <Text strong>Note:</Text> The name of a cluster corresponds to the first mention in its cluster, so if you modify the assignment of a first mention, the name of the clusters will change in both the cluster bank and the hierarchy. 
</Paragraph>

<Paragraph>
No need to remember all these functionalities, they also appear in the helper integrated in the tool (top left). 
</Paragraph>
</Content>
            </React.Fragment>
        );
    }
}
