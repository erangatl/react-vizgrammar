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
import { VictoryBar, VictoryGroup, VictoryStack, VictoryTooltip } from 'victory';
import { timeFormat } from 'd3';
import _ from 'lodash';
import BaseChart from './BaseChart';
import ChartContainer from './ChartContainer';
import LegendComponent from './LegendComponent';
import darkTheme from './resources/themes/victoryDarkTheme';
import lightTheme from './resources/themes/victoryLightTheme';
import Constants from './util/Constants';

/**
 * Class to handle visualization of Bar charts.
 */
export default class BarChart extends BaseChart {

    constructor(props) {
        super(props);
        this.handleMouseEvent = this.handleMouseEvent.bind(this);
        this.handleLegendInteraction = this.handleLegendInteraction.bind(this);
        this.getBarChartComponent = this.getBarChartComponent.bind(this);
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

    /**
     * Check if the chart is horizontal.
     * @param {Object} config - chart configuration provided by the user.
     * @returns {Boolean} - true in the case of the chart alignment is horizontal false if not.
     */
    static isHorizontal(config) {
        return _.find(config.charts, { orientation: 'left' });
    }

    /**
     * Generate the chart components in the case where there's only Bar charts defined in the chart config.
     * @param {Array} chartArray - Array containing objects that has the information to visualize each area chart.
     * @param {String} xScale - xAxis scale to be used in the charts.
     * @param {Object} dataSets - object containing arrays of data after classification.
     * @param {Object} config - object containing user provided chart configuration
     * @param {Function} onClick - function to be executed on click event
     * @param {Array} ignoreArray - array that contains dataSets to be ignored in rendering the components.
     * @returns {{chartComponents: Array, legendComponents: Array}}
     */
    getBarChartComponent(chartArray, dataSets, config, onClick, xScale, ignoreArray, currentTheme, isOrdinal) {
        const chartComponents = [];
        const legendComponents = [];
        let dataSetLength = 1;

        if (isOrdinal) {
            const xValueCollection = [];

            _.keys(dataSets).forEach((key) => {
                dataSets[key].forEach((d) => {
                    if (_.indexOf(xValueCollection, d.x) === -1) {
                        xValueCollection.push(d.x);
                    }
                });
            });

            _.keys(dataSets).forEach((key) => {
                const tempValueSet = [];

                xValueCollection.forEach((xValue) => {
                    const arrayIndex = _.findIndex(dataSets[key], obj => obj.x === xValue);

                    if (arrayIndex > -1) {
                        tempValueSet.push(dataSets[key][arrayIndex]);
                    } else {
                        tempValueSet.push({ x: xValue, y: 0 });
                    }
                });

                dataSets[key] = tempValueSet;
            });
        }

        chartArray.forEach((chart, chartIndex) => {
            const localSet = [];
            _.keys(chart.dataSetNames).forEach((dsName) => {
                let tmName = this.trimLegendLabel(16, dsName);
                legendComponents.push({
                    name: tmName,
                    fullName: dsName,
                    symbol: { fill: _.indexOf(ignoreArray, tmName) > -1 ? '#d3d3d3' : chart.dataSetNames[dsName] },
                    chartIndex,
                });

                if (xScale === 'time' && dataSets[dsName].length === 1) {
                    for (let i = 0; i < 2; i++) {
                        const simulatedDataSet = Object.assign({}, dataSets[dsName][0]);
                        simulatedDataSet.y = 0;
                        if (i === 0) {
                            simulatedDataSet.x += 10000;
                            dataSets[dsName].push(simulatedDataSet);
                        } else if (i === 1) {
                            simulatedDataSet.x -= 10000;
                            dataSets[dsName].push(simulatedDataSet);
                        }
                    }
                }

                if (dataSetLength < dataSets[dsName].length) dataSetLength = dataSets[dsName].length;
                if ((_.indexOf(ignoreArray, tmName)) === -1) {
                    localSet.push((
                        BarChart.getComponent(config, chartIndex, xScale, dataSets[dsName],
                            chart.dataSetNames[dsName], onClick, currentTheme)
                    ));
                }
            });

            if (chart.mode === 'stacked') {
                this.state.stacked = true;
                chartComponents.push((
                    <VictoryStack
                        key={`victoryStackGroup-${chart.id}`}
                        name="blacked"
                    >
                        {localSet}
                    </VictoryStack>
                ));
            } else {
                chartComponents.push(...localSet);
            }
        });

        const found0 = _.findIndex(_.values(dataSets), (o) => {
            if (o.length > 0) {
                return o[0].x === 0;
            } else {
                return false;
            }
        });

        if (found0 > -1 && !BarChart.isHorizontal(config)) {
            dataSetLength += 1;
        }

        return { chartComponents, legendComponents, dataSetLength };
    }

    /**
     * Generate a single Area chart component to be visualized.
     * @param {Object} config - Chart configuration provided by the user.
     * @param {Number} chartIndex - Index of the chart definition in the chart Array.
     * @param {String} xScale - Scale to be used in the xAxis when plotting the chart.
     * @param {Array} data - Array of objects that containing the dataset to be plotted using this chart component.
     * @param {String} color - Color the chart should be plotted in.
     * @param {Function} onClick - Function to be executed in the case of an click event.
     * @returns {Element}
     */
    static getComponent(config, chartIndex, xScale, data, color, onClick, currentTheme) {
        return (
            <VictoryBar
                key={`bar-${chartIndex}`}
                name="blacked"
                labels={
                    (() => {
                        if (xScale === 'time' && config.tipTimeFormat) {
                            return (d) => {
                                if (Number(d.y) == Number(d.y).toFixed(2)) {
                                    return `${config.x} : ${timeFormat(config.tipTimeFormat)(new Date(d.x))}\n` +
                                        `${config.charts[chartIndex].y} : ${Number(d.y)}`;
                                }
                                else {
                                    return `${config.x} : ${timeFormat(config.tipTimeFormat)(new Date(d.x))}\n` +
                                        `${config.charts[chartIndex].y} : ${Number(d.y).toFixed(2)}`;
                                }
                            };
                        } else {
                            return (d) => {
                                if (isNaN(d.x)) {
                                    if (Number(d.y) == Number(d.y).toFixed(2)) {
                                        return `${config.x} : ${d.x}\n${config.charts[chartIndex].y} : ${Number(d.y)}`;
                                    } else {
                                        return `${config.x} : ${d.x}\n${config.charts[chartIndex].y} : ${Number(d.y)
                                            .toFixed(2)}`;
                                    }
                                } else {
                                    if (Number(d.y) == Number(d.y).toFixed(2) && Number(d.x) == Number(d.x).toFixed(2)) {
                                        return `${config.x} : ${Number(d.x)}\n` +
                                            `${config.charts[chartIndex].y} : ${Number(d.y)}`;
                                    } else if (Number(d.y) == Number(d.y).toFixed(2)) {
                                        return `${config.x} : ${Number(d.x).toFixed(2)}\n` +
                                            `${config.charts[chartIndex].y} : ${Number(d.y)}`;
                                    } else if (Number(d.x) == Number(d.x).toFixed(2)) {
                                        return `${config.x} : ${Number(d.x)}\n` +
                                            `${config.charts[chartIndex].y} : ${Number(d.y).toFixed(2)}`;
                                    } else {
                                        return `${config.x} : ${Number(d.x).toFixed(2)}\n` +
                                            `${config.charts[chartIndex].y} : ${Number(d.y).toFixed(2)}`;
                                    }
                                }
                            };
                        }
                    })()
                }
                labelComponent={
                    <VictoryTooltip
                        orientation={BarChart.isHorizontal(config) ? 'left' : 'top'}
                        pointerLength={4}
                        cornerRadius={2}
                        flyoutStyle={{
                            fill: currentTheme.tooltip.style.flyout.fill,
                            fillOpacity: currentTheme.tooltip.style.flyout.fillOpacity,
                            strokeWidth: currentTheme.tooltip.style.flyout.strokeWidth,
                        }}
                        style={{ fill: currentTheme.tooltip.style.labels.fill }}
                    />
                }
                data={data}
                color={color}
                events={[
                    {
                        target: 'data',
                        eventHandlers: {
                            onClick: () => {
                                return [{ target: 'data', mutation: props => onClick(props) }];
                            },
                        },
                    },
                ]}
                animate={config.animate ? { onEnter: { duration: 100 } } : null}
            />
        );
    }

    calculateBarWidth(horizontal, height, width, range, timeStep) {
        let timeInterval;

        switch (timeStep) {
            case 'day':
                timeInterval = Constants.MILLISECONDS_FOR_DAY;
                break;
            case 'month':
                timeInterval = Constants.MILLISECONDS_FOR_MONTH;
                break;
            case 'year':
                timeInterval = Constants.MILLISECONDS_FOR_YEAR;
                break;
            case 'hour':
                timeInterval = Constants.MILLISECONDS_FOR_HOUR;
                break;
            case 'minute':
                timeInterval = Constants.MILLISECONDS_FOR_MINUTE;
                break;
            case 'second':
                timeInterval = Constants.MILLISECONDS_FOR_SECOND;
                break;
            default:
                timeInterval = 1;
        }

        return (horizontal ? (height - 120) : (width - 280)) / ((range / timeInterval) + 1);
    }

    render() {
        const { config, height, width, yDomain, theme } = this.props;
        const { chartArray, dataSets, xScale, ignoreArray, isOrdinal, xAxisRange, xAxisType } = this.state;
        const currentTheme = theme === 'light' ? lightTheme : darkTheme;

        let { chartComponents, legendComponents, dataSetLength } =
            this.getBarChartComponent(chartArray, dataSets, config, this.handleMouseEvent, xScale, ignoreArray,
                currentTheme, isOrdinal);

        let fullBarWidth = ((BarChart.isHorizontal(config) ?
            (height - 120) : (width - 280)) / (dataSetLength)) - 1;

        if (!isOrdinal) {
            if (xScale === 'time' && config.timeStep && xAxisRange[0]) {
                fullBarWidth = this.calculateBarWidth(BarChart.isHorizontal(config), height, width,
                    (xAxisRange[1] - xAxisRange[0]), config.timeStep.toLowerCase());
            } else {
                fullBarWidth = (BarChart.isHorizontal(config) ? (height - 120) : (width - 280)) /
                    ((dataSetLength + (2 * (config.linearSeriesStep || 1))) / (config.linearSeriesStep || 1));
            }
        }

        fullBarWidth = (fullBarWidth > 100) ? fullBarWidth * 0.8 : fullBarWidth;
        const barWidth = Math.floor(fullBarWidth / chartComponents.length);
        const legendColumns = Math.floor(width / 160);
        const maxLegendItems = Math.floor((height - 100) / 25);
        const legendOffset = config.legend === true && legendComponents.length > maxLegendItems ?
            (((Math.ceil(legendComponents.length / legendColumns)) * 30) + 50) : 0;
        chartComponents = [
            <VictoryGroup
                name="blacked"
                key="victoryMainGroup"
                horizontal={BarChart.isHorizontal(config)}
                offset={barWidth}
                style={{ data: { width: barWidth } }}
            >
                {chartComponents}
            </VictoryGroup>,
        ];

        return (
            <ChartContainer
                width={width}
                height={height}
                xScale={xScale}
                config={config}
                disableContainer
                horizontal={BarChart.isHorizontal(config)}
                yDomain={yDomain}
                theme={theme}
                isOrdinal={isOrdinal}
                dataSets={dataSets}
                barData={{ barWidth, dataSetLength, fullBarWidth }}
                legendOffset={legendOffset}
                legendItems={legendComponents}
            >
                {
                    config.legend === true ?
                        <LegendComponent
                            height={height}
                            width={width}
                            legendItems={legendComponents}
                            interaction={this.handleLegendInteraction}
                            config={config}
                        /> : null

                }
                {chartComponents}
            </ChartContainer>
        );
    }
}
