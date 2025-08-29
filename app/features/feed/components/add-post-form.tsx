
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import type { CreateMediaRequest } from "~/shared/types/create-post-type";
import { useManageMedia } from "../hooks/use-manage-media";
import { File, Image, Music, Video, X } from "lucide-react";

interface AddPostFormProps {
  title: string;
  setTitle: (value: string) => void;
  content: string;
  setContent: (value: string) => void;
  visibility: 'public' | 'private';
  setVisibility: (value: 'public' | 'private') => void;
  media: CreateMediaRequest[];
  setMedia: (media: CreateMediaRequest[]) => void;
  isPending: boolean;
  isUpdate: boolean;
  // handleUploadAndAddMedia?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AddPostForm: React.FC<AddPostFormProps> = ({
  title,
  setTitle,
  content,
  setContent,
  // media,
  // setMedia,
  isPending,
  isUpdate,
  // handleUploadAndAddMedia,
}) => {
  const {
    media,
    setMedia,
    isLoading,
    error,
    handleUploadAndAddMedia,
    getMediaType,
    selectedMedia,
    removeMedia,
  } = useManageMedia();

  const addMedia = () => {
    setMedia([
      ...media,
      { postId: '', name: '', type: 'image', url: '', thumbnailUrl: '' },
    ]);
  };


  const updateMediaField = (
    index: number,
    field: keyof CreateMediaRequest,
    value: string
  ) => {
    const updated = [...media];
    updated[index][field] = value;
    setMedia(updated);
  };

  return (
    <div className="space-y-5">
      <div>
        <Label
          htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isPending}
          className="h-12 mt-2"
          placeholder="Enter title"
        />
      </div>

      <div>
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isPending}
          className="mt-2"
          placeholder="Enter content"
        />
      </div>
      {/* error */}
      {error && (
        <div className="border border-destructive text-destructive px-4 py-3 rounded-lg flex items-center justify-center">
          <span className="text-sm">{error}</span>
        </div>
      )}
      {!isUpdate && (
        <div className="space-y-4">
          <Label>Media</Label>
          <Label
            htmlFor="select-media-item"
            className={`w-full my-3 rounded-2xl bg-primary flex items-center justify-center text-white py-2 cursor-pointer h-10 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90'}`}
          >+ Add Media</Label>
          <Input id="select-media-item" type="file" className="hidden" disabled={isLoading} onChange={isLoading ? () => { } : handleUploadAndAddMedia} />
          {isLoading && (
            <div className="space-y-4">
              <div className="border p-3 rounded-md space-y-2">
                <div className="flex gap-2">
                  <div className="w-full h-10 rounded flex items-center justify-between">
                    <div className="w-fit h-10 rounded flex items-center justify-between">
                      <div className="">
                        <div className="animate-spin rounded-full h-7 w-7 border-4 border-primary border-b-transparent mx-3"></div>
                      </div>
                      <div className="px-3 text-sm">
                        {selectedMedia ? selectedMedia.name : "No file selected"}
                      </div>
                    </div>

                    <div className="px-3">
                      {selectedMedia && getMediaType(selectedMedia).toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {media.length === 0 && !isLoading && (
            <div className="w-full text-center text-sm text-muted-foreground">
              No media added. Click "Add Media" to upload files.
            </div>
          )}

          {media.map((m, index) => {
            const name = m.url.split('/').pop()?.split('.').shift();
            return (
              <div className="space-y-4" key={index}>
                <div className="border p-3 rounded-md space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-full h-10 rounded flex items-center justify-start">
                      <div className="">
                        {/* 'image' | 'video' | 'audio' | 'other' */}
                        {m.type === 'image' && (<Image className="h-7 w-7 text-primary mx-3" />)}
                        {m.type === 'video' && (<Video className="h-7 w-7 text-primary mx-3" />)}
                        {m.type === 'audio' && (<Music className="h-7 w-7 text-primary mx-3" />)}
                        {m.type === 'other' && (<File className="h-7 w-7 text-primary mx-3" />)}
                      </div>
                      <div className="px-3 text-sm">
                        {m.name || name || "Unnamed"}
                      </div>
                    </div>

                    <div className="flex items-center justify-end">
                      <div className="px-3">
                        {m.type.toUpperCase()}
                      </div>
                      <Button size={"icon"} variant={"destructive"} onClick={() => removeMedia(index)}>
                        <X />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* {media.map((m, index) => (
            <div key={index} className="border p-3 rounded-md space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Name"
                  value={m.name}
                  onChange={(e) => updateMediaField(index, 'name', e.target.value)}
                  disabled={isPending}
                />
                <Select
                  value={m.type}
                  onValueChange={(value) => updateMediaField(index, 'type', value)}
                  disabled={isPending}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="file">File</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input
                placeholder="URL"
                value={m.url}
                onChange={(e) => updateMediaField(index, 'url', e.target.value)}
                disabled={isPending}
              />
              <Input
                placeholder="Thumbnail URL"
                value={m.thumbnailUrl}
                onChange={(e) => updateMediaField(index, 'thumbnailUrl', e.target.value)}
                disabled={isPending}
              />
              <Button
                variant="destructive"
                onClick={() => removeMedia(index)}
                disabled={isPending}
              >
                Remove
              </Button>
            </div>
          ))} */}
          {/* <Button
            variant="outline"
            onClick={addMedia}
            disabled={isPending}
            className="w-full my-3"
          >
            + Add Media
          </Button> */}
        </div>
      )
      }
    </div >
  );
};

export default AddPostForm;
