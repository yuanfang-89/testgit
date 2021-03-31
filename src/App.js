import './App.css';
import React, { useMemo, useCallback, useState } from 'react';
import { DataSet, Table, AutoComplete, Button,CodeArea } from 'choerodon-ui/pro';

// 引入格式化器，注意使用模块的默认导出
import JSONFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSONFormatter';

const App = () => {
  // 使用上章 DS 配置，new DS 实例
  const tableDS = useMemo(()=> {
    return new DataSet({
      dataToJSON :"all",
      // 指定 DataSet 初始化后自动查询
      autoQuery: true,
      // 请求分页大小
      pageSize: 8,
      
      // 主键字段名，一般用作级联行表的查询字段
      primaryKey: 'id',
      // 对应后端接口，自动生成约定的 submitUrl, queryUrl...
      name: 'user',
      // 数据对象名，默认值 'rows'
      dataKey: 'content',
      // DataSet 中包含的字段，对应上述后端数据中每条记录中的字段
      fields: [
          { name: 'id', type: 'number' },
          { name: 'name', type: 'string', label: '姓名', unique: true, help: '主键，区分用户' },
          { name: 'code', type: 'string', label: '编码' },
          { name: 'sex', type: 'string', label: '性别', lookupUrl: 'https://www.fastmock.site/mock/423302b318dd24f1712751d9bfc1cbbc/mock/EMPLOYEE_GENDER' ,
            dynamicProps: {
              required: ({ record }) => record.get('age') > 18,
            }
          },
          { name: 'active', label: '状态', type: 'boolean' },
          { name: 'age', type: 'number', label: '年龄', max: 100, min: 1, step: 1, sortable: true, help: '用户年龄，可以排序'},
          { name: 'email', type: 'string', label: '邮箱', help: '用户邮箱，可以自动补全'
          },
          { name: 'startDate', type: 'date', label: '加入日期'}
      ],
      // 接口自定义配置
      transport: {
          // 查询请求的 axios 配置或 url 字符串
          read: {
              url: 'https://www.fastmock.site/mock/423302b318dd24f1712751d9bfc1cbbc/mock/guide/user',
              method: 'GET',
          }
      },
      // DS 事件回调
      events: {
          load: ({ dataSet }) => {
              console.log('加载完成', dataSet)
          },
          query: ({ params, data }) => setConsoleValue({params, data}),
      },

      queryFields: [
        {
          name: 'name',
          type: 'string',
          label: '姓名',
        },
        {
          name: 'age',
          type: 'number',
          label: '年龄',
          max: 100,
          step: 1,
        },
        {
          name: 'email',
          type: 'string',
          label: '邮箱',
          help: '用户邮箱，可以自动补全',
            
        }
        
      ],
      
    });
    // eslint-disable-next-line
  }, []);

  // 处理数据源 emailOptionDS（这里类似 Select 组件数据源操作）
  const emailOptionDS = useMemo(() => {
    return new DataSet({
      fields: [
        {
          name: 'value',
          type: 'string',
        },
        {
          name: 'meaning',
          type: 'string',
        },
      ],
    });
  }, []);

  // 处理组件上的事件，为数据源 emailOptionDS 加载数据：
  const handleValueChange = useCallback((v) => {
    const { value } = v.target;
    const suffixList = ['@qq.com', '@163.com', '@hand-china.com'];
    if (value.indexOf('@') !== -1) {
     // 如果输入值中包含 @ 不配置数据，自定义输入
      emailOptionDS.loadData([]);
    } else {
      emailOptionDS.loadData(
        suffixList.map((suffix) => ({
          value: `${value}${suffix}`,
          meaning: `${value}${suffix}`,
        })),
      );
    }
  }, [emailOptionDS]);
  
  // 表格列配置
  const columns = useMemo(()=>{
    return [
      { name: 'name', editor: true },
      { name: 'age', editor: true },
      { 
        name: 'sex',
        editor: true 
      },
      { 
        name: 'email',
        // 邮箱自动添加后缀
        //1. 行内编辑器根据 type 默认匹配 EmailField 组件，我们需要修改为 AutoComlpete 组件
        //2. 为 AutoComlpete 组件配置自动补全数据源，对应 options 属性
        //3. 处理 AutoComlpete 输入获焦事件，判断是否需要后缀
        editor: () => {
          return (
            <AutoComplete
              onFocus={handleValueChange}
              onInput={handleValueChange}
              options={emailOptionDS}
            />
          );
        },
       },
      { name: 'code', editor: true },
      { name: 'startDate', editor: true },
      { name: 'active', editor: true }
    ];
    // eslint-disable-next-line
  }, []);


  // 自定义按钮
  const [consoleValue, setConsoleValue] = useState('');
  const toDataButton = (
    <Button onClick={() => setConsoleValue(tableDS.toData())}>
      toData
    </Button>
  );
  const toJSONDataButton = (
    <Button onClick={() => setConsoleValue(tableDS.toJSONData())}>
      toJSONData
    </Button>
  );
  const setQueryParamButton = (
    <Button onClick={() => tableDS.setQueryParameter('customPara', 'test')}>
      setQueryParameter
    </Button>
  );

  return (
    <div style={{ width: 1200, padding: 100 }}>
      <h1>C7N Pro Table</h1>
      <Table
        dataSet={tableDS}
        columns={columns}

        queryBar="professionalBar"
        queryFieldsLimit={2}  //一行查询条件为两个
        buttons={['add', 'query', 'save', 'delete', 'reset', toDataButton, toJSONDataButton, setQueryParamButton]}
      />
     <CodeArea
        style={{ height: 280 }}
        formatter={JSONFormatter}
        value={JSON.stringify(consoleValue)}
      />
    </div>
    
  );
};
export default App;