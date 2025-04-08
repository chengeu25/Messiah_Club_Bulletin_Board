import Button from '../formElements/Button.component';

/**
 * Represents the properties for the reportedComment component
 * 
 * @interface ReportedCommentProps
 * @property {number} commentId - The unique identifier for the comment
 * @property {string} content - The text content of the comment
 * @property {number} eventId - The unique identifier for the event associated with the comment
 * @property {boolean} isDeleted - Indicates if the comment has been deleted
 * @property {number} parentId - The unique identifier for the parent comment (if any)
 * @property {Date} lastModified - The timestamp of when the comment was last modified
 * @property {number} userId - The unique identifier for the user who made the comment
 * @property {string} submitHandler - The function to handle comment submission
 */
interface ReportedCommentProps {
    commentId: number;
    content: String;
    eventId: number;
    isDeleted: boolean;
    parentId: number;
    lastModified: Date;
    userId: number;
    submitHandler: (event: React.FormEvent<HTMLFormElement>) => void;
}

const reportedComment = ({
    commentId,
    content,
    eventId,
    isDeleted,
    parentId,
    lastModified,
    userId,
    submitHandler
}: ReportedCommentProps) => (
    <div className='flex flex-col gap-2 bg-gray-200 rounded-lg p-4'>
        <div className='flex items-center gap-4'>
            <div className='text-sm text-gray-500'>{userId}</div>
            <div className='text-sm text-gray-500'>{lastModified.toString()}</div>

            <div className='flex-shrink-0 text-sm text-gray-500'>
                Reported
            </div>
        </div>
        <div className='text-sm text-black'>{content}</div>
        <div className='flex flex-row w-full gap-2 items-center'>
            <div className='flex-shrink-0'>
                <Button
                    name='approve'
                    text='Approve'
                    type='submit'
                    filled={true}
                    className='w-auto'
                />
            </div>
            <div className='flex-shrink-0'>
                <Button
                    name='decline'
                    text='Decline'
                    type='submit'
                    filled={true}
                    className='w-auto'
                />
            </div>
            <div className='flex-shrink-0'>
                <Button
                    name='context'
                    text='Context'
                    type='button'
                    filled={true}
                    className='w-auto'
                    onClick={() => window.open(`/dashboard/event/${eventId}`, '_blank')}
                />
            </div>
        </div>
    </div>
);

export default reportedComment;