/*
 * Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';
import { Grid } from 'material-ui';
import VizG from '../../src/VizG';
import '../styles/snippet-highlight.css';
import ChartWrapper from '../ChartWrapper';
import { syntaxHighlight } from './util/SyntaxHighLight';
import Header from '../components/Header';

export default class BarChartSamples extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            data2: [],
            timer: 1,
        };

        this.interval_id = null;
        this.metadata = {
            names: ['rpm', 'torque', 'horsepower', 'EngineType'],
            types: ['linear', 'linear', 'linear', 'ordinal'],
        };
        this.barChartConfig = {
            x: 'rpm',
            charts: [{ type: 'bar', y: 'torque', color: 'EngineType', colorDomain: ['', '', 'piston'] }],
            maxLength: 7,
            legend: true,
        };

        this.singleBarChartConfig = {
            x: 'rpm',
            charts: [
                { type: 'bar', y: 'horsepower', fill: '#2ca02c' },
                { type: 'bar', y: 'torque', fill: '#ff7f0e' },
            ],
            maxLength: 7,
            legend: true,
        };

        this.barChartStackedConfig = {
            x: 'rpm',
            charts: [{ type: 'bar', y: 'torque', color: 'EngineType', colorDomain: ['', '', 'piston'], mode: 'stacked' }],
            maxLength: 7,
            legend: true,
        };

        this.barChartStackedConfigHorizontal = {
            x: 'rpm',
            charts: [
                {
                    type: 'bar',
                    y: 'torque',
                    color: 'EngineType',
                    colorDomain: ['', '', 'piston'],
                    mode: 'stacked',
                    orientation: 'left',
                },
            ],
            maxLength: 7,
            legend: true,
        };

        this.ordinalDataChart = {
            x: 'Quarter',
            charts: [
                {
                    type: 'bar',
                    y: 'Sales',
                    color: 'Product',
                    mode: 'stacked',
                },
            ],
            legend: true,
        };

        this.ordinalMetadata = {
            names: ['Quarter', 'Sales', 'Product'],
            types: ['ordinal', 'linear', 'ordinal'],
        };

        this.ordinalData = [
            ['Q1', 100000, 'Product 1'],
            ['Q1', 150000, 'Product 2'],
            ['Q1', 50000, 'Product 3'],
            ['Q1', 240000, 'Product 4'],
            ['Q2', 14000, 'Product 1'],
            ['Q2', 300000, 'Product 2'],
            ['Q2', 140000, 'Product 3'],
            ['Q2', 242000, 'Product 4'],
            ['Q3', 110000, 'Product 1'],
            ['Q3', 200000, 'Product 2'],
            ['Q3', 140000, 'Product 3'],
            ['Q3', 240000, 'Product 4'],
            ['Q4', 240000, 'Product 1'],
            ['Q4', 156009, 'Product 2'],
            ['Q4', 149000, 'Product 3'],
            ['Q4', 24000, 'Product 4'],
        ];
    }

    componentDidMount() {
        this.interval_id = setInterval(() => {
            this.setState({
                data: [
                    [this.state.timer, this.state.timer === 20 ? null : Math.random() * 100, 10, 'piston'],
                    [this.state.timer, Math.random() * 100, 10, 'rotary'],
                ],
                data2: [
                    [this.state.timer, Math.random() * 100, Math.random() * 100, 'rotary'],
                ],
                timer: this.state.timer + 1,
            });
        }, 500);
    }

    componentWillUnmount() {
        clearInterval(this.interval_id);
    }

    render() {
        return (
            <div>
                <Header url={'/samples'} title={'Bar Chart Samples'} />
                <Grid container>
                    <Grid item lg={6} sm={12} xs={12} >
                        <ChartWrapper title="Bar Chart Sample with Color Categorization" chart="line" media
                            actionBar={false}>
                            <div>
                                <div style={{ height: 450 }}>
                                    <VizG config={this.barChartConfig} metadata={this.metadata} data={this.state.data}
                                        theme={this.props.theme} />
                                </div>
                                <div>
                                    <br /><br />
                                    <pre
                                        dangerouslySetInnerHTML={
                                            {
                                                __html: syntaxHighlight(
                                                    JSON.stringify(this.barChartConfig, undefined, 4)),
                                            }
                                        }
                                    />
                                </div>
                            </div>

                        </ChartWrapper>
                    </Grid>
                    <Grid item lg={6} sm={12} xs={12} >
                        <ChartWrapper title="Bar Chart Sample with an ordinal Dataset." chart="line" media
                            actionBar={false}>
                            <div>
                                <div style={{ height: 450 }}>
                                    <VizG
                                        config={this.ordinalDataChart}
                                        metadata={this.ordinalMetadata}
                                        data={this.ordinalData}
                                        theme={this.props.theme}
                                    />
                                </div>
                                <div>
                                    <br /><br />
                                    <pre
                                        dangerouslySetInnerHTML={{
                                            __html: syntaxHighlight(JSON
                                                .stringify(this.ordinalDataChart, undefined, 4)),
                                        }}
                                    />
                                </div>
                            </div>
                        </ChartWrapper>
                    </Grid>
                    <Grid item lg={6} sm={12} xs={12} >
                        <ChartWrapper title="Bar Chart Sample with Multiple Chart objects in the Config" chart="line"
                            media actionBar={false}>
                            <div>
                                <div style={{ height: 450 }}>
                                    <VizG
                                        config={this.singleBarChartConfig}
                                        metadata={this.metadata}
                                        data={this.state.data2}
                                        theme={this.props.theme}
                                    />
                                </div>
                                <div>
                                    <br /><br />
                                    <pre
                                        dangerouslySetInnerHTML={{
                                            __html: syntaxHighlight(JSON
                                                .stringify(this.singleBarChartConfig, undefined, 4)),
                                        }}
                                    />
                                </div>
                            </div>
                        </ChartWrapper>
                    </Grid>
                    <Grid item lg={6} sm={12} xs={12} >
                        <ChartWrapper title="Stacked Bar Chart Sample" chart="line" media actionBar={false}>
                            <div>
                                <div style={{ height: 450 }}>
                                    <VizG
                                        config={this.barChartStackedConfig}
                                        metadata={this.metadata}
                                        data={this.state.data}
                                        theme={this.props.theme}
                                    />
                                </div>
                                <div>
                                    <br /><br />
                                    <pre
                                        dangerouslySetInnerHTML={{
                                            __html: syntaxHighlight(JSON
                                                .stringify(this.barChartStackedConfig, undefined, 4)),
                                        }}
                                    />
                                </div>
                            </div>
                        </ChartWrapper>
                    </Grid>
                    <Grid item lg={6} sm={12} xs={12} >
                        <ChartWrapper title="Horizontal Bar Chart Sample" chart="line" media actionBar={false}>
                            <div>
                                <div style={{ height: 450 }}>
                                    <VizG
                                        config={this.barChartStackedConfigHorizontal}
                                        metadata={this.metadata}
                                        data={this.state.data}
                                        theme={this.props.theme}
                                    />
                                </div>
                                <div>
                                    <br /><br />
                                    <pre
                                        dangerouslySetInnerHTML={{
                                            __html: syntaxHighlight(JSON
                                                .stringify(this.barChartStackedConfigHorizontal, undefined, 4)),
                                        }}
                                    />
                                </div>
                            </div>
                        </ChartWrapper>
                    </Grid>
                    <Grid item lg={6} sm={12} xs={12} >
                        <ChartWrapper title="Sample Data set" chart="line" media actionBar={false}>
                            <div className="json-structure" >
                                metadata :
                                <pre
                                    dangerouslySetInnerHTML={{
                                        __html: syntaxHighlight(JSON.stringify(this.metadata, undefined, 4)),
                                    }}
                                />
                                <br />
                                data :
                                <pre
                                    dangerouslySetInnerHTML={{
                                        __html: syntaxHighlight(JSON.stringify(this.state.data, undefined, 4)),
                                    }}
                                />
                            </div>
                        </ChartWrapper>
                    </Grid>
                    <Grid item lg={6} sm={12} xs={12} >
                        <ChartWrapper title="Chart JSON structure" chart="line" media actionBar={false}>
                            <div className="json-structure" >
                                <ul>
                                    <li>
                                        <strong>x</strong> - Datafield representing the independant axis in the metadata
                                    </li>
                                    <li>
                                        <strong>charts</strong> - Array of chart objects to be visualized.
                                        <ul>
                                            <li>
                                                <strong>Chart Object</strong>
                                                <ul>
                                                    <li>
                                                        <strong>type</strong> - type of the chart required to be visualized
                                                    </li>
                                                    <li>
                                                        <strong>y</strong> - Data field representing y-axis in the metadata
                                                    </li>
                                                    <li>
                                                        <strong>color</strong> - Data field representing color
                                                        categorization data field of the metadata
                                                    </li>
                                                    <li>
                                                        <strong>colorScale</strong> - Array of colors in hex form that
                                                        will be over-riding the default color set
                                                    </li>
                                                    <li>
                                                        <strong>colorDomain</strong> - If a certain color category needs
                                                        to be plotted in a specific color.
                                                    </li>
                                                    <li>
                                                        <strong>fill</strong> - If a color categorization field is not
                                                        defined the color in which the data should be plotted.
                                                    </li>
                                                    <li>
                                                        <strong>mode</strong> - mode of the chart stacked or not.
                                                    </li>
                                                    <li>
                                                        <strong>orientation</strong> - orientation of the bars left or
                                                        bottom
                                                    </li>
                                                </ul>
                                            </li>
                                            <li>....</li>
                                        </ul>
                                    </li>
                                    <li>
                                        <strong>maxLength</strong> - Max length of data points to be visualized in the
                                        chart at time
                                    </li>
                                    <li>
                                        <strong>legend</strong> - enable or disable legend (boolean) value.
                                    </li>
                                    <li>
                                        <strong>Append</strong> - Append the incoming data to the existing dataset or
                                        replace the existing dataset boolean value.
                                    </li>
                                    <li>
                                        <strong>timeFormat</strong> - If the x-axis is a time series using this attribute
                                        user can format the tick values of the x axis using regex. refer&nbsp;
                                        <a href={'https://github.com/d3/d3-time-format/blob/master/README.md#timeFormat'}>
                                            d3 documentation
                                        </a> for more info
                                    </li>
                                    <li>
                                        <strong>tipTimeFormat</strong> - If the x-axis is a time series using this attribute
                                        user can format the tick values of the x axis using regex. refer&nbsp;
                                        <a href={'https://github.com/d3/d3-time-format/blob/master/README.md#timeFormat'}>
                                            d3 documentation
                                        </a> for more info
                                    </li>
                                    <li><strong>animate</strong> - animate chart visualizations</li>
                                    <li><strong>disableVerticleGrid</strong> - Disable verticle grid of the chart
                                        (boolean value)</li>
                                    <li><strong>disableHorizontalGrid</strong> - Disable horizontal grid of the chart
                                        (boolean value)</li>
                                    <li><strong>yAxisLabel</strong> - Change the label shown along the y-axis</li>
                                    <li><strong>xAxisLabel</strong> - Change the label shown along the x-axis</li>
                                    <li><strong>yAxisTickCount</strong> - Number of ticks shown in the y-axis</li>
                                    <li><strong>xAxisTickCount</strong> - Number of ticks shown in the x-axis</li>
                                    <li><strong>legendOrientation</strong> - Orientation of the legend relative to the
                                        chart top | bottom | left | right)</li>
                                    <li><strong>legendOffset</strong> - Set a vertical offset for legend</li>
                                    <li><strong>timeStep</strong> - Define the interval between two tick values in the 
                                    series('day' | 'month' | 'year' | 'minute' | 'hour' | 'second' | 'millisecond') 
                                    *Only for timeSeries bar chart</li>
                                    <li><strong>linearSeriesStep</strong> - Define the interval between two tick values
                                     in the series(Number) *Only for linearSeries bar chart</li>
                                    <li><strong>brush</strong> - show a component to brush data(boolean value)</li>
                                    <li>
                                        <strong>style</strong> - object that contain style attributes of the charts.
                                        <ul>
                                            <li><strong>axisColor</strong> - color of the axis lines</li>
                                            <li><strong>axisLabelColor</strong> - color of the axis labels</li>
                                            <li><strong>xAxisTickAngle</strong> - Tick angle of the x-axis ticks</li>
                                            <li><strong>yAxisTickAngle</strong> - Tick angle of the y-axis ticks</li>
                                            <li><strong>tickLabelColor</strong> - font color of the tickLabels</li>
                                        </ul>
                                    </li>
                                </ul>
                            </div>
                        </ChartWrapper>
                    </Grid>

                </Grid>
            </div>
        );
    }
}

