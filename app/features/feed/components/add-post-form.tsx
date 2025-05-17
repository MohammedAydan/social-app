import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import type { CreateMediaRequest } from "~/shared/types/create-post-type";

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
}

const AddPostForm: React.FC<AddPostFormProps> = ({
  title,
  setTitle,
  content,
  setContent,
  media,
  setMedia,
  isPending,
}) => {
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

  const removeMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isPending}
        />
      </div>

      <div>
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isPending}
        />
      </div>

      <div className="space-y-4">
        <Label>Media</Label>
        {media.map((m, index) => (
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
        ))}
        <Button
          variant="outline"
          onClick={addMedia}
          disabled={isPending}
          className="w-full my-3"
        >
          + Add Media
        </Button>
      </div>
    </div>
  );
};

export default AddPostForm;
