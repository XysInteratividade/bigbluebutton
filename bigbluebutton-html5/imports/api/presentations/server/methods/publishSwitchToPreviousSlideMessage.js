import { publish } from '/imports/api/common/server/helpers';
import { isAllowedTo } from '/imports/startup/server/userPermissions';
import { appendMessageHeader } from '/imports/api/common/server/helpers';
import Presentations from '/imports/api/presentations';
import Slides from '/imports/api/slides';
import { redisConfig } from '/config';

Meteor.methods({
  publishSwitchToPreviousSlideMessage(credentials) {
    const { meetingId, requesterUserId, requesterToken } = credentials;
    let currentPresentationDoc, currentSlideDoc, message, previousSlideDoc;
    currentPresentationDoc = Presentations.findOne({
      meetingId: meetingId,
      'presentation.current': true,
    });
    if (currentPresentationDoc != null) {
      currentSlideDoc = Slides.findOne({
        meetingId: meetingId,
        presentationId: currentPresentationDoc.presentation.id,
        'slide.current': true,
      });
      if (currentSlideDoc != null) {
        previousSlideDoc = Slides.findOne({
          meetingId: meetingId,
          presentationId: currentPresentationDoc.presentation.id,
          'slide.num': currentSlideDoc.slide.num - 1,
        });
        if ((previousSlideDoc != null) && isAllowedTo('switchSlide', credentials)) {
          message = {
            payload: {
              page: previousSlideDoc.slide.id,
              meeting_id: meetingId,
            },
          };
          message = appendMessageHeader('go_to_slide', message);
          return publish(redisConfig.channels.toBBBApps.presentation, message);
        }
      }
    }
  },
});
