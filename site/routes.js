import config from './config';
import TdesignComponents from './pages/components';
import TdesignDemoList from './pages/demo-list';
import TdesignDemoPage from './pages/demo-page';

const demoReq = require.context('../examples', true, /demos[/\\][\w-]+\.vue$/im);

const { docs } = config;

function getDocsRoutes(docs, type) {
  let docsRoutes = [];
  let docRoute;

  docs.forEach((item) => {
    const docType = item.type || type;
    let { children } = item;
    if (item.type === 'component') {
      children = item.children.sort((a, b) => {
        const nameA = a.name.toUpperCase();
        const nameB = b.name.toUpperCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      });
    }
    if (children) {
      docsRoutes = docsRoutes.concat(getDocsRoutes(children, docType));
    } else {
      docRoute = {
        ...item,
        meta: item.meta || {},
      };
      docsRoutes.push(docRoute);
    }
  });
  return docsRoutes;
}

/**
 * 生成可独立调试的 demo 路由
 * 访问路径 /demos/组件目录名/demo 文件名（无后缀）
 */
function getDemoRoutes() {
  if (process.env.NODE_ENV === 'development') {
    return demoReq.keys().map((key) => {
      const match = key.match(/([\w-]+).demos.([\w-]+).vue/);
      const [, componentName, demoName] = match;
      return {
        path: `/vue/demos/${componentName}/${demoName}`,
        props: { componentName, demo: demoReq(key).default },
        component: TdesignDemoPage,
      };
    });
  }
  return [];
}
const demoRoutes = getDemoRoutes();
const routes = [
  {
    path: '/vue/components',
    redirect: '/vue/components/button',
    component: TdesignComponents,
    children: getDocsRoutes(docs),
  },
  {
    path: '*',
    redirect: '/vue/components/button',
  },
  ...demoRoutes,
  {
    path: '/vue/demos*',
    component: TdesignDemoList,
    props: { demoRoutes },
  },
];
export default routes;
