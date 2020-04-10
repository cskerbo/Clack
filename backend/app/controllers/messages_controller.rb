class MessagesController < ApplicationController
  before_action :authenticate_user
  def create
    message = Message.new(message_params)
    room = Room.find(message.room_id)
    if message.save!
      RoomChannel.broadcast_to(room, message)
      render json: message
    else
      render json: message.errors.full_message
    end
  end

  private

  def message_params
    params.require(:message).permit(:content, :room_id, :user_id)
  end
end