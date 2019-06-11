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
import { VictoryGroup, VictoryStack } from 'victory';
import _ from 'lodash';
import BaseChart from './BaseChart';
import LineChart from './LineChart';
import AreaChart from './AreaChart';
import BarChart from './BarChart';
import ChartContainer from './ChartContainer';
import LegendComponent from './LegendComponent';
import darkTheme from './resources/themes/victoryDarkTheme';
import lightTheme from './resources/themes/victoryLightTheme';

/**
 * Class to handle visualization of Charts consisting of Area, Bar and Line Charts.
 */
export default class ComposedChart extends BaseChart {

    constructor(props) {
        super(props);
        this.handleMouseEvent = this.handleMouseEvent.bind(this);
        this.handleLegendInteraction = this.handleLegendInteraction.bind(this);
    }

    trimLegendLabel(characterLength, text) {
        if (text) {
            if (text.length > characterLength) {
                return text.slice(0, 6) + '...' + text.slice(-(characterLength - 7));
            } else {
                return text + new Array(16 - text.length).join(' ');
            }
        }
    }

    render() {
        const finalLegend = [];
        const chartComponents = [];
        const { config, height, width, theme } = this.props;
        const { chartArray, dataSets, xScale, ignoreArray } = this.state;
        const currentTheme = theme === 'light' ? lightTheme : darkTheme;

        chartArray.forEach((chart, chartIndex) => {
            const localChartSet = [];
            let dataSetLength = 1;
            _.keys(chart.dataSetNames).forEach((dsName) => {
                let tmName = this.trimLegendLabel(16, dsName);
                finalLegend.push({
                    name: tmName,
                    fullName: dsName,
                    symbol: { fill: _.indexOf(ignoreArray, tmName) > -1 ? '#d3d3d3' : chart.dataSetNames[dsName] },
                    chartIndex,
                });
                if (dataSetLength < dataSets[dsName].length) dataSetLength = dataSets[dsName].length;
                const component = {
                    line: () => {
                        return LineChart
                            .getComponent(config, chartIndex, xScale, dataSets[dsName], chart.dataSetNames[dsName],
                                null, currentTheme);
                    },
                    area: () => {
                        return AreaChart
                            .getComponent(config, chartIndex, xScale, dataSets[dsName], chart.dataSetNames[dsName],
                                null, currentTheme);
                    },
                    bar: () => {
                        return BarChart
                            .getComponent(config, chartIndex, xScale, dataSets[dsName], chart.dataSetNames[dsName],
                                null, currentTheme);
                    },
                };

                if (_.indexOf(ignoreArray, tmName) === -1) {
                    localChartSet.push(component[chart.type]());
                }
            });

            if (chart.mode === 'stacked') {
                chartComponents.push(
                    (<VictoryStack>
                        {localChartSet}
                    </VictoryStack>));
            } else if (chart.type === 'bar') {
                const barWidth =
                    ((BarChart.isHorizontal(config) ?
                        (height - 80) : (width - 280)) / (dataSetLength * localChartSet.length)) - 1;

                chartComponents.push((
                    <VictoryGroup
                        horizontal={(chart.orientation === 'left')}
                        offset={barWidth}
                        style={{ data: { width: barWidth } }}
                    >
                        {localChartSet}
                    </VictoryGroup>
                ));
            } else {
                chartComponents.push(...localChartSet);
            }
        });

        const columnWidth = 160;
        const leftLineHeight = 25;
        const bottomLineHeight = 30;
        const xAxisLabelOffset = 50;
        const legendColumns = Math.floor(width / columnWidth);
        const maxLegendItems = Math.floor((height - 100) / leftLineHeight);
        const legendOffset = (config.legend === true && (finalLegend.length > maxLegendItems)) ?
            (((Math.ceil(finalLegend.length / legendColumns)) * bottomLineHeight) + xAxisLabelOffset) : 0;

        return (
            <ChartContainer
                width={width}
                height={height}
                xScale={xScale}
                config={config}
                theme={theme}
                disableContainer
                legendOffset={legendOffset}
            >
                {
                    config.legend === true ?
                        <LegendComponent
                            height={height}
                            width={width}
                            legendItems={finalLegend}
                            interaction={this.handleLegendInteraction}
                            config={config}
                        /> : null

                }
                {chartComponents}
            </ChartContainer>
        );
    }
}
