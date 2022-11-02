import { Button, Empty, Skeleton, Table, Tag, Typography } from "@douyinfe/semi-ui";
import { IconHeartStroked, IconPlayCircle, IconShareStroked } from "@douyinfe/semi-icons";
import { ColumnProps } from "@douyinfe/semi-ui/lib/es/table";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getPlaylistTrackList, getSongListDetail } from "@/http/api";
import { IllustrationNoResult, IllustrationNoResultDark } from "@douyinfe/semi-illustrations";
import { Song } from "@/types/home";
import { formatPlayTime } from "@/utils";
import { useState } from "react";
import "./index.scss";

const { Title, Paragraph } = Typography;

function SongList() {
  const { id } = useParams();

  const [curMouseId, setCurMouseId] = useState<number>();

  const {
    data: detailData,
    isLoading,
    isError
  } = useQuery(["songDetail", id], () => getSongListDetail({ id }), {
    select(data) {
      if (data.code === 200) return data.playlist || {};
    }
  });

  const { name, coverImgUrl, tags, description } = detailData || {};

  const { data: listData, isLoading: listLoading } = useQuery(
    ["songList", id],
    () => getPlaylistTrackList({ id: parseInt(id!) }),
    {
      select(data) {
        if (data.code === 200) return data.songs;
      }
    }
  );

  const columns: ColumnProps<Song>[] = [
    {
      title: "序号",
      dataIndex: "sort",
      width: 80,
      render: (text, record, index) => index + 1
    },
    {
      title: "歌曲",
      dataIndex: "name"
    },
    {
      title: "歌手",
      dataIndex: "singer",
      render: (text, record) => {
        return record?.ar?.[0]?.name || "--";
      }
    },
    {
      title: "专辑",
      dataIndex: "album",
      render: (text, record) => {
        return record?.al?.name || "--";
      }
    },
    {
      title: "时长",
      dataIndex: "dt",
      width: 200,
      align: "right",
      className: "song-list--duration",
      render: (text, record) => {
        if (curMouseId && curMouseId === record.id) {
          return (
            <div className="flex justify-between">
              <IconPlayCircle className="cursor-pointer" size="large" />
              <IconHeartStroked className="cursor-pointer" size="large" />
              <IconShareStroked className="cursor-pointer" size="large" />
            </div>
          );
        }
        return formatPlayTime(text / 1000);
      }
    }
  ];
  if (isError) {
    return (
      <Empty
        image={<IllustrationNoResult />}
        darkModeImage={<IllustrationNoResultDark />}
        description={"没有找到相关歌单"}
        className="p-8"
      />
    );
  }
  return (
    <div className="song-list--wrapper flex flex-col w-heart--wrappe px-32">
      <Skeleton
        placeholder={
          <div className="flex py-6">
            <div className="w-64 h-64 shrink-0 mr-8">
              <Skeleton.Image className="w-full h-full" />
            </div>
            <div className="flex-1 flex flex-col">
              <Skeleton.Title className="mb-2" />
              <Skeleton.Paragraph rows={3} />
              <Skeleton.Button className="mt-auto" />
            </div>
          </div>
        }
        loading={isLoading}
        active
      >
        <div className="flex py-6">
          <div className="w-64 h-64 shrink-0 mr-8">
            <img src={`${coverImgUrl}?param=224y224`} className="w-full h-full" alt="" />
          </div>
          <div className="flex flex-col">
            <Title heading={2}>{name}</Title>
            <Paragraph
              ellipsis={{
                rows: 4,
                expandable: true,
                collapsible: true
              }}
              className="mt-4"
            >
              {description}
            </Paragraph>
            <div className="mt-4 mb-4">
              {tags?.map((item) => (
                <Tag size="large" color="red" className="mr-3" key={item}>
                  #{item}
                </Tag>
              ))}
            </div>
            <div className="mt-auto">
              <Button type="primary" theme="solid" size="large" className="mr-4">
                播放全部
              </Button>
              <Button type="tertiary" theme="solid" size="large" icon={<IconHeartStroked />} className="mr-4">
                收藏
              </Button>
              <Button type="tertiary" theme="solid" icon={<IconShareStroked />} size="large">
                分享
              </Button>
            </div>
          </div>
        </div>
      </Skeleton>

      <Title heading={3}>全部歌曲</Title>
      <Table
        loading={listLoading}
        columns={columns}
        dataSource={listData || []}
        pagination={false}
        className="mt-5"
        onRow={(record) => {
          return {
            onMouseEnter: () => {
              setCurMouseId(record?.id);
            }, // 鼠标移入行
            onMouseLeave: () => {
              setCurMouseId(undefined);
            } // 鼠标移出行
          };
        }}
      />
    </div>
  );
}

export default SongList;
