import React, { useState, useEffect } from 'react';
import './index.css';
import ReactECharts from 'echarts-for-react';
import { Tab, Tabs, TabList } from 'react-tabs';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import Modal from 'react-modal';
import Button from '@mui/material/Button';
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import DatePicker from "react-datepicker";
import { addDays, subDays } from "date-fns";
import moment from 'moment'


function App() {
  const [dataOrigin, setDataOrigin] = useState({});
  const [dateFilterStart, setDateFilterStart] = useState(null);
  const [dateFilterEnd, setDateFilterEnd] = useState(null);
  const [tabIndex, setTabIndex] = useState(6);
  const [openModal, setOpenModal] = useState(false);
  const [stateCal, setStateCal] = useState([
    {
      startDate: subDays(new Date(), 0),
      endDate: addDays(new Date(), 0),
      key: "selection"
    }
  ]);

  useEffect(async () => {
    await fetch('/dataArray.json')
        .then((response) => {
          response.json().then((dataItem) => {
            setDataOrigin(dataItem)
          })
        })
  }, []);
  // useEffect(async () => { await fetch('/wp-json/irc/v2/liquidation').then((response) => response.json().then((dataItem) => setDataOrigin(dataItem))) }, []);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']


  const reverceArrayFun = (array) => {
    switch (tabIndex) {
      case 0:
        return array.slice(Math.max(array.length - 7, 1))
      case 1:
        return array.slice(Math.max(array.length - 30, 1))
      case 2:
        return array.slice(Math.max(array.length - 90, 1))
      case 3:
        return array.slice(Math.max(array.length - 365, 1))
      case 4:
        return array.slice(Math.max(array.length - 730, 1))
      case 5:
        return array.slice(Math.max(array.length - 1095, 1))
      case 6:
        return array
      case 7:
        return array
      case 8:
        return array.slice().filter(item =>
            (dateFilterEnd ? moment().diff(dateFilterEnd) <= moment().diff(item.date) : item.date) && (dateFilterStart ? moment().diff(dateFilterStart) >= moment().diff(item.date) : item.date)
        )

    }
  }

  function numFormatter(value) {
    let num = value;
    if (num < 0) { num = Math.abs(num) }
    let suffixes = ["", "K", "M", "B", "T"],
        suffixNum = Math.floor(("" + num).length / 3),
        shortValue = parseFloat((suffixNum != 0 ? (num / Math.pow(1000, suffixNum)) : num).toPrecision(2));
    return "$" + shortValue + suffixes[suffixNum];
  }

  dataOrigin.btc_currency = typeof dataOrigin.btc_currency === 'undefined' ? [] : dataOrigin.btc_currency;

  const option = {
    color: [
      '#e0294a',
      '#41c390',
      '#d8a70d'
    ],
    tooltip: {
      trigger: 'axis',
      formatter: function ( param ) {
        let $template = '',
            $title;
        param.forEach(($item, $key) => {
          let $value;
          switch ($key) {
            case 0 :
              $value = dataOrigin.btc_liquidation_short[$item.dataIndex].value;
            break;
            case 1 :
              $value = dataOrigin.btc_liquidation_long[$item.dataIndex].value;
            break;
            case 2 :
              $value = dataOrigin.btc_currency[$item.dataIndex].value;
            break;
          }
          if($key === 0) {

          }
          $title = '<div>' + $item.name + '</div>';
          $template += '<div class="rowTitle">';
          $template += $item.marker;
          $template += $item.seriesName;
          $template += '<b>' + (Math.abs($value)).toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
          }) + '</b>';
          $template += '</div>';
        });

        return $title + $template;
      },
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999'
        }
      }
    },
    grid: {
      left: '10%'
    },
    toolbox: {
      feature: {
        dataView: {
          show: false,
          readOnly: false
        },
        magicType: {
          show: false,
          type: ['line', 'bar']
        },
        restore: {
          show: false
        },
        saveAsImage: {
          show: true
        }
      }
    },
    legend: {
      data: [
        'Shorts',
        'Longs',
        'BTC Price'
      ]
    },
    xAxis: [
      {
        type: 'category',
        data: reverceArrayFun(dataOrigin.btc_currency).map(itemI => {
                return (`${itemI.date.split("-")[2] + " " + months[Number(itemI.date.split("-")[1]) - 1] + " " + itemI.date.split("-")[0]}`)
              })
        ,
        axisPointer: {
          type: 'shadow'
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        axisLabel: { formatter: (name) => numFormatter(Number(name)) }
      },
      {
        type: 'value',
        axisLabel: { formatter: (name) => numFormatter(Number(name)) }
      }
    ],
    series: [
      {
        name: 'Shorts',
        type: 'bar',
        stack: 'one',
        data: dataOrigin?.btc_liquidation_short ? reverceArrayFun(dataOrigin.btc_liquidation_short).map(itemI => {
          return tabIndex === 7 ? -Math.log10(itemI.value) : -itemI.value
        }) : [],
      },
      {
        name: 'Longs',
        type: 'bar',
        stack: 'one',
        data: dataOrigin?.btc_liquidation_long ? reverceArrayFun(dataOrigin.btc_liquidation_long).map(itemI => {
          return tabIndex === 7 ? Math.log10(itemI.value) : itemI.value
        }) : [],
      },
      {
        name: 'BTC Price',
        type: 'line',
        yAxisIndex: 1,
        showSymbol: false,
        data: dataOrigin?.btc_currency ? reverceArrayFun(dataOrigin.btc_currency).map(itemI => {
          return Number(tabIndex === 7 ? Math.log10(itemI.value) : itemI.value)
        }) : [],
      }
    ]
  };

  const customStyles = {
    content: {
      top: '50%',
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
    },
  };

  const handleOnChange = ranges => {
    const { selection } = ranges;
    setDateFilterStart(selection.startDate)
    setDateFilterEnd(selection.endDate)
    setStateCal([selection]);
  };

  return (
      <div className='containerCal'>
        <div className='wrapFilters'>
          <Tabs selectedIndex={tabIndex} onSelect={
            index => {
              if (index !== 8) {
                setTabIndex(index)
              } else {
                setTabIndex(index);
                setOpenModal(true);
              }
            }
          }>
            <TabList>
              <Tab>7D</Tab>
              <Tab>1M</Tab>
              <Tab>3M</Tab>
              <Tab>1Y</Tab>
              <Tab>2Y</Tab>
              <Tab>3Y</Tab>
              <Tab>All</Tab>
              <Tab>LOG</Tab>
              <Tab>
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" height="20px" width="20px" viewBox="0 0 24 24"  >
                  <path fillRule="evenodd" clipRule="evenodd" d="M15 5H9V4C9 3.44772 8.55228 3 8 3C7.44772 3 7 3.44772 7 4V5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H17V4C17 3.44772 16.5523 3 16 3C15.4477 3 15 3.44772 15 4V5ZM6 7C5.44772 7 5 7.44771 5 8V10H19V8C19 7.44772 18.5523 7 18 7H17C17 7.55228 16.5523 8 16 8C15.4477 8 15 7.55228 15 7H9C9 7.55228 8.55228 8 8 8C7.44772 8 7 7.55228 7 7H6ZM19 12H5V18C5 18.5523 5.44772 19 6 19H18C18.5523 19 19 18.5523 19 18V12Z"></path>
                </svg>
              </Tab>
            </TabList>
          </Tabs>
        </div>
        <Modal isOpen={openModal} onRequestClose={() => setOpenModal(false)} style={customStyles}  >

          <DatePicker selected={stateCal} onChange={handleOnChange} />


          {/* <DateRange
          onChange={handleOnChange}
          months={1}
          ranges={stateCal}
          direction="vertical"
        /> */}
          <Button variant="contained" onClick={() => { setOpenModal(false); setDataOrigin(dataOrigin) }}>Done</Button>
        </Modal>
        <ReactECharts option={option} />
      </div >
  )
}

export default App;




