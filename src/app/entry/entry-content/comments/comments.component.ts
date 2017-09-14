import { Component, ElementRef, OnInit, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { Comment } from './comment.model';

import { MeasureService } from 'app/entry/entry-content/measures/measures.service';
import { ModalsService } from 'app/modals/modals.service';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {

  commentsForm: FormGroup;
  comments: any;
  @Input() question: any;
  @Input() measure: any;
  @Input() questionId: any;
  @Input() measureId: any;
  @Input() pia: any;

  constructor(private el: ElementRef,
              private _measureService: MeasureService,
              private _modalsService: ModalsService) { }

  ngOnInit() {
    this.comments = [];
    const commentsModel = new Comment();
    commentsModel.pia_id = this.pia.id;
    if (this.measure) {
      commentsModel.reference_to = this.measure.id;
    } else {
      commentsModel.reference_to = this.question.id;
    }

    commentsModel.findAllByReference().then((entries) => {
      this.comments = entries;
      this.comments.reverse();
    });

    this.commentsForm = new FormGroup({
      description: new FormControl()
    });
  }


  /**
   * Shows or hides the block which allows users to create a new comment.
   */
  toggleNewCommentBox() {
    const newCommentBox = this.el.nativeElement.querySelector('.pia-commentsBlock-new');
    // Opens comments list if it's closed.
    const accordeonButton = this.el.nativeElement.querySelector('.pia-commentsBlock-btn button span');
    const commentsList = this.el.nativeElement.querySelector('.pia-commentsBlock-list');
    if (commentsList && accordeonButton) {
      if (commentsList.classList.contains('close') && accordeonButton.classList.contains('pia-icon-accordeon-down')) {
        accordeonButton.classList.toggle('pia-icon-accordeon-up');
        accordeonButton.classList.remove('pia-icon-accordeon-down');
      }
      commentsList.classList.remove('close');
    }
    newCommentBox.classList.toggle('open');
  }

  /**
   * Shows or hides the block which allows users to create a new comment.
   */
  newCommentFocusOut() {
    // Checks if the comment value exists.
    if (this.commentsForm.value.description && this.commentsForm.value.description.length > 0) {
      // Checks if there are already comments and if so, checks if the last comment value is different from our current comment.
      if (this.comments.length > 0 && this.comments[0].description === this.commentsForm.value.description) {
        this._modalsService.openModal('modal-same-comment');
      } else {
        // Creates the new comment and pushes it as the first comment in list.
        // Updates accordeon and counter + removes the written comment.
        const commentRecord = new Comment();
        commentRecord.for_measure = false;
        commentRecord.description = this.commentsForm.value.description;
        commentRecord.pia_id = this.pia.id;
        if (this.measure) {
          commentRecord.for_measure = true;
          commentRecord.reference_to = this.measure.id;
        } else {
          commentRecord.reference_to = this.question.id;
        }
        commentRecord.create().then((id: number) => {
          commentRecord.id = id;
          this.comments.unshift(commentRecord);
          this.commentsForm.controls['description'].setValue('');
          this.toggleNewCommentBox();
          // this.updateCommentsCounter();
          this.getCommentsAccordeonStatus();
        });
      }
    }
  }

  /**
   * Display comments list.
   */
  displayCommentsList() {
    const commentsList = this.el.nativeElement.querySelector('.pia-commentsBlock-list');
    const btn = this.el.nativeElement.querySelector('.pia-commentsBlock-btn button span');
    btn.classList.toggle('pia-icon-accordeon-down');
    btn.classList.toggle('pia-icon-accordeon-up');
    commentsList.classList.toggle('close');
  }

  /**
   * Returns a status about the comments number.
   * @returns {Boolean} true if there are comments, false otherwise.
   */
  getCommentsAccordeonStatus() {
    return this.comments.length > 0 ? true : false;
  }

}
