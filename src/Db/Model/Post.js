// --------------- LIBRARIES ---------------
import { Model } from "@nozbe/watermelondb";
import {
    field,
    date,
    children,
    writer,
    readonly,
} from "@nozbe/watermelondb/decorators";

// --------------- MODEL ---------------
export default class Post extends Model {
    static table = "posts";

    static associations = {
        comments: { type: "has_many", foreignKey: "post_id" },
    };

    @field("title") title;
    @field("body") body;
    @children("comments") comments;
    @readonly @date("created_at") createdAt;
    @readonly @date("updated_at") updatedAt;

    // writers ---------------
    @writer async getPost() {
        return {
            title: this.title,
            body: this.body,
            isPinned: this.isPinned,
            comments: this.comments,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }

    @writer async updatePost({ title, body }) {
        return await this.update((post) => {
            post.title = title;
            post.body = body;
        });
    }

    deleteAllComments() {
        return this.comments.destroyAllPermanently();
    }

    @writer async deletePost() {
        return await Promise.all([
            this.deleteAllComments(),
            this.markAsDeleted(),
            this.destroyPermanently(),
        ]);
    }

    @writer async addComment(body) {
        return await this.collections.get("comments").create((comment) => {
            comment.post.set(this);
            comment.body = body;
            comment.is_nasty = false;
        });
    }
}
