import '../styles/index.css';
import OperationButton from "../components/OperationButton";

function App() {
    return <>
        <div className='xl-operation-bar'>
            <OperationButton to='/renameUnZippableFile'>递归重命名压缩文件</OperationButton>
            <OperationButton to='/unzipFiles'>递归解压缩文件</OperationButton>
            <OperationButton to='/renameToTopName'>递归重命名为上层文件名</OperationButton>
            <OperationButton to='/moveToDir'>递归移动文件到指定文件夹</OperationButton>
            <OperationButton to='/CompositeOperation'>组合拳</OperationButton>
        </div>
        <div className='xl-operation-bar'>
            <OperationButton to='/rename'>重命名</OperationButton>
            <OperationButton to='/setting'>设置</OperationButton>
            <OperationButton to='/logs'>日志</OperationButton>
        </div>
    </>
}

export default App;
