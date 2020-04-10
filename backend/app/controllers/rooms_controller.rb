class RoomsController < ApplicationController
  before_action :authenticate_user
  def index
    rooms = Room.all
    render json: rooms
  end

  def create
    room = Room.new(room_params)
    if room.save!
      render json: room, status: 200
    else
      render json: room.errors.full_message, status: 422
    end
  end

  def user_rooms
    rooms = Room.where(user_id: params[:room][:user_id])
    render json: rooms
  end

  def show
    room = Room.find(params[:id])
    render json: room, include: [:messages]
  end

  private

  def room_params
    params.require(:room).permit(:name, :user_id)
  end
end