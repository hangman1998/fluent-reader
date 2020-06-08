import * as React from "react"
import { Label, DefaultButton, TextField, Stack, PrimaryButton, DetailsList, 
    IColumn, SelectionMode, Selection, IChoiceGroupOption, ChoiceGroup } from "@fluentui/react"
import { SourceState, RSSSource, SourceOpenTarget } from "../../scripts/models/source"
import { urlTest } from "../../scripts/utils"
import DangerButton from "../utils/danger-button"

type SourcesTabProps = {
    sources: SourceState
    addSource: (url: string) => void
    updateSourceName: (source: RSSSource, name: string) => void
    updateSourceOpenTarget: (source: RSSSource, target: SourceOpenTarget) => void
    deleteSource: (source: RSSSource) => void
    importOPML: () => void
}

type SourcesTabState = {
    [formName: string]: string
} & {
    selectedSource: RSSSource
}

const columns: IColumn[] = [
    {
        key: "favicon",
        name: "图标",
        fieldName: "name",
        isIconOnly: true,
        iconName: "ImagePixel",
        minWidth: 16,
        maxWidth: 16,
        onRender: (s: RSSSource) => s.iconurl && (
            <img src={s.iconurl} className="favicon" />
        )
    },
    {
        key: "name",
        name: "名称",
        fieldName: "name",
        minWidth: 200,
        data: 'string',
        isRowHeader: true
    },
    {
        key: "url",
        name: "URL",
        fieldName: "url",
        minWidth: 280,
        data: 'string'
    }
]

const sourceOpenTargetChoices: IChoiceGroupOption[] = [
    { key: String(SourceOpenTarget.Local), text: "RSS正文" },
    { key: String(SourceOpenTarget.Webpage), text: "加载网页" },
    { key: String(SourceOpenTarget.External), text: "在浏览器中打开" }
]

class SourcesTab extends React.Component<SourcesTabProps, SourcesTabState> {
    selection: Selection

    constructor(props) {
        super(props)
        this.state = {
            newUrl: "",
            newSourceName: "",
            selectedSource: null
        }
        this.selection = new Selection({
            getKey: s => (s as RSSSource).sid,
            onSelectionChanged: () => {
                let source = this.selection.getSelectedCount() ? this.selection.getSelection()[0] as RSSSource : null
                this.setState({
                    selectedSource: source,
                    newSourceName: source ? source.name : ""
                })
            }
        })
    }

    handleInputChange = (event) => {
        const name: string = event.target.name
        this.setState({[name]: event.target.value.trim()})
    }

    addSource = (event: React.FormEvent) => {
        event.preventDefault()
        if (urlTest(this.state.newUrl)) this.props.addSource(this.state.newUrl)
    }

    onOpenTargetChange = (_, option: IChoiceGroupOption) => {
        let newTarget = parseInt(option.key) as SourceOpenTarget
        this.props.updateSourceOpenTarget(this.state.selectedSource, newTarget)
        this.setState({selectedSource: {...this.state.selectedSource, openTarget: newTarget} as RSSSource})
    }

    render = () => (
        <div className="tab-body">
            <Label>OPML文件</Label>
            <Stack horizontal>
                <Stack.Item>
                    <PrimaryButton onClick={this.props.importOPML} text="导入文件" />
                </Stack.Item>
                <Stack.Item>
                    <DefaultButton text="导出文件" />
                </Stack.Item>
            </Stack>

            <form onSubmit={this.addSource}>
                <Label htmlFor="newUrl">添加订阅源</Label>
                <Stack horizontal>
                    <Stack.Item grow>
                        <TextField 
                            onGetErrorMessage={v => urlTest(v.trim()) ? "" : "请正确输入URL"} 
                            validateOnLoad={false} 
                            placeholder="输入URL"
                            value={this.state.newUrl}
                            id="newUrl"
                            name="newUrl"
                            onChange={this.handleInputChange} />
                    </Stack.Item>
                    <Stack.Item>
                        <PrimaryButton 
                            disabled={!urlTest(this.state.newUrl)}
                            type="submit"
                            text="添加" />
                    </Stack.Item>
                </Stack>
            </form>

            <DetailsList
                items={Object.values(this.props.sources)} 
                columns={columns}
                getKey={s => s.sid}
                setKey="selected"
                selection={this.selection}
                selectionMode={SelectionMode.single} />

            {this.state.selectedSource && <>
                <Label>选中订阅源</Label>
                <Stack horizontal>
                    <Stack.Item grow>
                        <TextField
                            onGetErrorMessage={v => v.trim().length == 0 ? "名称不得为空" : ""}
                            validateOnLoad={false}
                            placeholder="订阅源名称"
                            value={this.state.newSourceName}
                            name="newSourceName"
                            onChange={this.handleInputChange} />
                    </Stack.Item>
                    <Stack.Item>
                        <DefaultButton
                            disabled={this.state.newSourceName.length == 0}
                            onClick={() => this.props.updateSourceName(this.state.selectedSource, this.state.newSourceName)}
                            text="修改名称" />
                    </Stack.Item>
                </Stack>
                <ChoiceGroup 
                    label="订阅源文章打开方式" 
                    options={sourceOpenTargetChoices}
                    selectedKey={String(this.state.selectedSource.openTarget)}
                    onChange={this.onOpenTargetChange} />
                <Stack horizontal style={{marginTop: 24}}>
                    <Stack.Item>
                        <DangerButton
                            onClick={() => this.props.deleteSource(this.state.selectedSource)}
                            key={this.state.selectedSource.sid}
                            text={`删除订阅源`} />
                    </Stack.Item>
                    <Stack.Item>
                        <span className="settings-hint">这将移除此订阅源与所有已保存的文章</span>
                    </Stack.Item>
                </Stack>
            </>}
        </div>
    )
}

export default SourcesTab