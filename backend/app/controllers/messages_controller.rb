class MessagesController < ApplicationController
  def create
    message = Message.new(message_params)
    room = Room.find(message.room_id)
    RoomChannel.broadcast_to(room, message)
    render json :message
  end

  private

  def message_params
    params.require(:message).permit(:content, :room_id)
  end
end