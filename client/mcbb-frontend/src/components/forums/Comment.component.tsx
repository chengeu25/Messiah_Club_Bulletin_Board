import Button from '../formElements/Button.component';
import Input from '../formElements/Input.component';

interface CommentProps {
  creator: string;
  content: string;
  lastModified: Date;
  indentLevel?: number;
}

const Comment = ({
  creator,
  content,
  lastModified,
  indentLevel = 0
}: CommentProps) => {
  return (
    <div
      className='flex flex-col gap-2 bg-gray-200 rounded-lg p-4'
      style={{ marginLeft: 20 * indentLevel }}
    >
      <div className='flex items-center gap-4'>
        <div className='text-sm text-slate-500'>{creator}</div>
        <div className='text-sm text-slate-500'>{lastModified.toString()}</div>
        <div className='text-sm text-slate-500 underline'>Report this</div>
      </div>
      <div className='text-sm text-black'>{content}</div>
      <div className='flex flex-row w-full gap-2 items-center'>
        <Input
          label='Reply: '
          placeholder='Reply'
          name='comment'
          type='text'
          color='blue'
          filled={false}
          labelOnSameLine
        />
        <div className='flex-shrink-0'>
          <Button color='blue' text='Reply' filled={true} className='w-auto' />
        </div>
      </div>
    </div>
  );
};

export default Comment;
